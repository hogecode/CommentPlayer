package commands

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/handler"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/middleware"
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
		cfg = &config.Config{
			Server: config.ServerConfig{Host: "0.0.0.0", Port: 8000},
			DB:     config.DBConfig{DSN: "app.db", MaxOpenConns: 10, MaxIdleConns: 5},
			Log:    config.LogConfig{Level: "info"},
		}
	}

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

	// ミドルウェアを登録
	engine.Use(middleware.Logger())
	engine.Use(middleware.Recovery())

	// API アプリケーションを初期化
	app := handler.NewApp(db)

	// ルートを登録
	app.RegisterRoutes(engine)

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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v\n", err)
	}

	log.Println("Server stopped gracefully")
}
