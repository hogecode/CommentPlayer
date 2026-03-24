package commands

import (
	"log"

	"fmt"

	"github.com/spf13/cobra"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/service"
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

// DBSeedCmd - シードデータ挿入コマンド
var DBSeedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Insert seed data",
	Long:  "Insert seed data into the database",
	Run:   dbSeedHandler,
}

// DBSeedClearCmd - シードデータクリアコマンド
var DBSeedClearCmd = &cobra.Command{
	Use:   "seed-clear",
	Short: "Clear all seed data",
	Long:  "Clear all seed data from the database",
	Run:   dbSeedClearHandler,
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
		&entity.Folder{},
		&entity.Video{},
		&entity.Capture{},
		&entity.User{},
	)
}

// dbSeedHandler - シードデータ挿入ハンドラー
func dbSeedHandler(cmd *cobra.Command, args []string) {
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

	// シードワーカーを初期化
	seedWorker := service.NewSeedWorker(db)

	// デフォルトシードデータを取得
	seedData := service.GetDefaultSeedData()

	// シードデータを挿入
	if err := seedWorker.InsertSeedData(seedData); err != nil {
		log.Fatalf("Failed to insert seed data: %v\n", err)
	}

	log.Println("Seed data insertion completed successfully")
}

// dbSeedClearHandler - シードデータクリアハンドラー
func dbSeedClearHandler(cmd *cobra.Command, args []string) {
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

	// シードワーカーを初期化
	seedWorker := service.NewSeedWorker(db)

	// すべてのシードデータを削除
	if err := seedWorker.DeleteAllSeedData(); err != nil {
		log.Fatalf("Failed to delete seed data: %v\n", err)
	}

	log.Println("Seed data deletion completed successfully")
}
