package commands

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/hogecode/CommentVideo/internal/config"
	"github.com/hogecode/CommentVideo/internal/entity"
	"github.com/hogecode/CommentVideo/internal/handler"
	"github.com/hogecode/CommentVideo/internal/i18n"
	"github.com/hogecode/CommentVideo/internal/middleware"
)

// ServeCmd - サーバー起動コマンド
var ServeCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the API server",
	Long:  "Start the CommentVideo API server",
	Run: func(cmd *cobra.Command, args []string) {
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
		if err := db.AutoMigrate(
			&entity.Video{},
			&entity.Capture{},
			&entity.User{},
		); err != nil {
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

		// サーバーを起動
		addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
		log.Printf("Starting server on %s\n", addr)
		if err := engine.Run(addr); err != nil {
			log.Fatalf("Failed to start server: %v\n", err)
		}
	},
}

// initDB - データベース接続を初期化
func initDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return db, nil
}
