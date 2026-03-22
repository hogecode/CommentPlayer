package commands

import (
	"log"

	"fmt"
	"github.com/spf13/cobra"
	"gorm.io/gorm"
	"gorm.io/driver/sqlite"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/entity"
)

// DBCmd - データベースコマンド
var DBCmd = &cobra.Command{
	Use:   "db",
	Short: "Database utilities",
	Long:  "Database utilities and migrations",
}

// DBMigrateCmd - データベースマイグレーション
var DBMigrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Run database migrations",
	Long:  "Run database migrations",
	Run:   dbMigrateHandler,
}

// dbMigrateHandler - データベースマイグレーション実行
func dbMigrateHandler(cmd *cobra.Command, args []string) {
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

	log.Println("Database migration completed successfully")
}

// initDB - データベース接続を初期化
func initDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return db, nil
}

// migrateDB - データベースマイグレーション
func migrateDB(db *gorm.DB) error {
	return db.AutoMigrate(
		&entity.Video{},
		&entity.Capture{},
		&entity.User{},
	)
}
