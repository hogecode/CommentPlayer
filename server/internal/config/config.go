package config

import (
	"fmt"

	"github.com/spf13/viper"
)

// Environment - 環境の種類
type Environment string

const (
	Development Environment = "development"
	Production  Environment = "production"
	Staging     Environment = "staging"
	Testing     Environment = "testing"
)

// Config - アプリケーション設定
type Config struct {
	Environment Environment
	Server      ServerConfig
	DB          DBConfig
	Log         LogConfig
	Storage     StorageConfig
	Series      SeriesConfig
}

// StorageConfig - ストレージ設定
type StorageConfig struct {
	CapturesDir   string `mapstructure:"captures_dir"`
	ScreenshotsDir string `mapstructure:"screenshots_dir"`
}

// SeriesConfig - シリーズ設定
type SeriesConfig struct {
	Patterns []string `mapstructure:"patterns"` // ファイル名パターン例: "{title}{episode}", "{title}-{episode}"
}

// ServerConfig - サーバー設定
type ServerConfig struct {
	Port      int    `mapstructure:"port"`
	Host      string `mapstructure:"host"`
	JWTSecret string `mapstructure:"jwt_secret"`
}

// DBConfig - データベース設定
type DBConfig struct {
	DSN          string `mapstructure:"dsn"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	LogLevel     string `mapstructure:"log_level"`
}

// LogConfig - ログ設定
type LogConfig struct {
	Level    string `mapstructure:"level"`
	Format   string `mapstructure:"format"`
	UseColor bool   `mapstructure:"use_color"`
}

// LoadConfig - 設定ファイルから読み込む
func LoadConfig(configPath string) (*Config, error) {
	viper.SetConfigType("yaml")
	viper.SetConfigFile(configPath)

	// 環境変数をバインド
	viper.BindEnv("environment", "APP_ENV")
	viper.BindEnv("server.port", "SERVER_PORT")
	viper.BindEnv("server.host", "SERVER_HOST")
	viper.BindEnv("server.jwt_secret", "JWT_SECRET")
	viper.BindEnv("db.dsn", "DB_DSN")
	viper.BindEnv("log.level", "LOG_LEVEL")
	viper.BindEnv("log.use_color", "LOG_USE_COLOR")

	// デフォルト値の設定
	setDefaults()

	// ファイルから読み込み（ファイルが存在しない場合は環境変数のみ使用）
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
		// 設定ファイルが存在しない場合は環境変数のデフォルト値を使用
	}

	cfg := &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Environment を文字列から型に変換
	envStr := viper.GetString("environment")
	switch envStr {
	case "production":
		cfg.Environment = Production
	case "staging":
		cfg.Environment = Staging
	case "testing":
		cfg.Environment = Testing
	case "development":
		fallthrough
	default:
		cfg.Environment = Development
	}

	return cfg, nil
}

// setDefaults - デフォルト値の設定
func setDefaults() {
	viper.SetDefault("environment", "development")
	viper.SetDefault("server.port", 8000)
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.jwt_secret", "your_jwt_secret_key_here")
	viper.SetDefault("db.dsn", "app.db")
	viper.SetDefault("db.max_open_conns", 10)
	viper.SetDefault("db.max_idle_conns", 5)
	viper.SetDefault("db.log_level", "silent")
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")
	viper.SetDefault("log.use_color", true)
	viper.SetDefault("storage.captures_dir", "captures")
	viper.SetDefault("storage.screenshots_dir", "public/screenshots")
	viper.SetDefault("series.patterns", []string{"{title}{episode}", "{title}-{episode}"})
}
