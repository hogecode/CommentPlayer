package config

import (
	"fmt"

	"github.com/spf13/viper"
)

// Config - アプリケーション設定
type Config struct {
	Server ServerConfig
	DB     DBConfig
	Log    LogConfig
}

// ServerConfig - サーバー設定
type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Host string `mapstructure:"host"`
}

// DBConfig - データベース設定
type DBConfig struct {
	DSN           string `mapstructure:"dsn"`
	MaxOpenConns  int    `mapstructure:"max_open_conns"`
	MaxIdleConns  int    `mapstructure:"max_idle_conns"`
	LogLevel      string `mapstructure:"log_level"`
}

// LogConfig - ログ設定
type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

// LoadConfig - 設定ファイルから読み込む
func LoadConfig(configPath string) (*Config, error) {
	viper.SetConfigType("yaml")
	viper.SetConfigFile(configPath)

	// 環境変数をバインド
	viper.BindEnv("server.port", "SERVER_PORT")
	viper.BindEnv("server.host", "SERVER_HOST")
	viper.BindEnv("db.dsn", "DB_DSN")
	viper.BindEnv("log.level", "LOG_LEVEL")

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

	return cfg, nil
}

// setDefaults - デフォルト値の設定
func setDefaults() {
	viper.SetDefault("server.port", 8000)
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("db.dsn", "app.db")
	viper.SetDefault("db.max_open_conns", 10)
	viper.SetDefault("db.max_idle_conns", 5)
	viper.SetDefault("db.log_level", "silent")
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")
}
