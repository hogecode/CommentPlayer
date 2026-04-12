package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config represents the application configuration
type Config struct {
	Server struct {
		Host      string `yaml:"host"`
		Port      int    `yaml:"port"`
		JWTSecret string `yaml:"jwt_secret"`
		Schemes   string `yaml:"schemes"`
	} `yaml:"server"`
	Storage struct {
		CapturesDir string `yaml:"captures_dir"`
	} `yaml:"storage"`
	Series struct {
		Patterns []string `yaml:"patterns"`
	} `yaml:"series"`
}

// LoadConfig loads configuration from a YAML file
func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("設定ファイルの読み込みに失敗しました: %w", err)
	}

	config := &Config{}
	if err := yaml.Unmarshal(data, config); err != nil {
		return nil, fmt.Errorf("設定ファイルのパースに失敗しました: %w", err)
	}

	return config, nil
}

// SaveConfig saves configuration to a YAML file
func SaveConfig(path string, config *Config) error {
	// Create directory if it doesn't exist
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	data, err := yaml.Marshal(config)
	if err != nil {
		return fmt.Errorf("設定ファイルのマーシャリングに失敗しました: %w", err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("設定ファイルの書き込みに失敗しました: %w", err)
	}

	return nil
}

// ValidateConfig validates the configuration
func ValidateConfig(config *Config) error {
	// Validate required fields
	if config.Server.Host == "" {
		return fmt.Errorf("server.host は必須です")
	}
	if config.Server.Port <= 0 || config.Server.Port > 65535 {
		return fmt.Errorf("server.port は 1 から 65535 の間である必要があります")
	}
	if config.Server.Schemes == "" {
		return fmt.Errorf("server.schemes は必須です")
	}
	if config.Storage.CapturesDir == "" {
		return fmt.Errorf("storage.captures_dir は必須です")
	}

	return nil
}

// GetServerURL returns the server URL
func (c *Config) GetServerURL() string {
	port := c.Server.Port
	portStr := ""
	if (c.Server.Schemes == "http" && port != 80) ||
		(c.Server.Schemes == "https" && port != 443) {
		portStr = fmt.Sprintf(":%d", port)
	}

	host := c.Server.Host
	if host == "0.0.0.0" || host == "::" {
		host = "localhost"
	}

	return fmt.Sprintf("%s://%s%s", c.Server.Schemes, host, portStr)
}
