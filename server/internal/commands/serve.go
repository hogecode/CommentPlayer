package commands

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/handler"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/logger"
	"github.com/hogecode/commentPlayer/internal/middleware"
	"github.com/hogecode/commentPlayer/internal/service"
)

// ServeCmd - サーバー起動コマンド
var ServeCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the API server",
	Long:  "Start the commentPlayer API server",
	Run:   serveCommandHandler,
}

// serveCommandHandler - サーバー起動コマンドのハンドラー
func serveCommandHandler(cmd *cobra.Command, args []string) {
	// i18nを初期化
	if err := i18n.Init(); err != nil {
		log.Printf("Warning: Failed to initialize i18n: %v\n", err)
	}

	// 設定を読み込む
	cfg, err := config.LoadConfig("config.yaml")
	if err != nil {
		log.Printf("Failed to load config: %v (using defaults)\n", err)
		// TODO: errorCode: 1 を返すようにする
		cfg = &config.Config{
			Environment: config.Development,
			Server:      config.ServerConfig{Host: "0.0.0.0", Port: 8000, JWTSecret: "your-secret-key"},
			DB:          config.DBConfig{DSN: "app.db", MaxOpenConns: 10, MaxIdleConns: 5},
			Log:         config.LogConfig{Level: "info", UseColor: true},
		}
	}

	// JWT_SECRET をデフォルト値から上書き
	if cfg.Server.JWTSecret == "" {
		cfg.Server.JWTSecret = "your-secret-key"
	}

	// ロガーを初期化
	if err := logger.Init(cfg); err != nil {
		log.Printf("Warning: Failed to initialize logger: %v\n", err)
	}

	slog.Info("Application starting", "environment", string(cfg.Environment), "port", cfg.Server.Port)

	// データベース接続を初期化
	db, err := initDB(cfg.DB.DSN)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v\n", err)
	}

	// テーブルをマイグレーション
	if err := migrateDB(db); err != nil {
		log.Fatalf("Failed to migrate database: %v\n", err)
	}

	// Gin エンジンを初期化
	engine := gin.Default()

	// CORS ミドルウェアを登録
	engine.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	// ミドルウェアを登録
	engine.Use(middleware.Logger())
	engine.Use(middleware.Recovery())

	// API アプリケーションを初期化
	app := handler.NewApp(db, cfg)

	// ファイルウォッチャーを初期化・開始
	screenshotDir := filepath.Join(".", "public", "screenshots")
	watcher, err := service.NewFileWatcher(db, screenshotDir)
	if err != nil {
		log.Printf("Warning: Failed to initialize file watcher: %v\n", err)
	} else {
		// AppにFileWatcherを設定
		app.FileWatcher = watcher

		// DBの監視対象フォルダをロードして同期
		if err := watcher.SyncFoldersWithDB(); err != nil {
			log.Printf("Warning: Failed to sync folders: %v\n", err)
		}
		// ファイルウォッチャーを開始
		watcher.Start()
		log.Println("File watcher started")
	}

	// ルートを登録
	app.RegisterRoutes(engine, cfg.Server.JWTSecret)

	// サーバーを起動（グレースフルシャットダウン対応）
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	server := &http.Server{
		Addr:    addr,
		Handler: engine,
	}

	// シグナルチャネルを作成
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// サーバーをゴルーチンで起動
	go func() {
		log.Printf("Starting server on %s\n", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v\n", err)
		}
	}()

	// シグナルを待機
	<-sigChan

	// グレースフルシャットダウン
	log.Println("\nReceived shutdown signal. Starting graceful shutdown...")

	// ファイルウォッチャーを停止
	if watcher != nil {
		if err := watcher.Stop(); err != nil {
			log.Printf("Error stopping file watcher: %v\n", err)
		}
		log.Println("File watcher stopped")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server stopped gracefully")
}
