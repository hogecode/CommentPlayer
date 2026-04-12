package installer

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// InstallOptions represents installation options
type InstallOptions struct {
	InstallPath     string
	Port            int
	JWTSecret       string
	StorageDir      string
	Schemes         string
	Host            string
	SkipFolderSetup bool
}

// ConfigData represents the server configuration structure
type ConfigData struct {
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

// DefaultConfig returns a default configuration
func DefaultConfig() *ConfigData {
	config := &ConfigData{}
	config.Server.Host = "0.0.0.0"
	config.Server.Port = 8000
	config.Server.Schemes = "http"
	config.Storage.CapturesDir = getPicturesDir()
	config.Series.Patterns = []string{
		"{title}{episode}",
		"{title}-{episode}",
	}
	return config
}

// ValidateInstallPath validates the installation path
func ValidateInstallPath(path string) error {
	// Check if path is absolute
	if !filepath.IsAbs(path) {
		return fmt.Errorf("インストール先のフォルダは絶対パスで入力してください")
	}

	// Check for invalid characters
	if strings.Contains(path, "#") {
		return fmt.Errorf("インストール先のパスには # を含めないでください")
	}

	// Windows-specific validation
	if runtime.GOOS == "windows" {
		if strings.Contains(path, "\\Users\\") && !strings.Contains(path, "\\AppData\\") {
			return fmt.Errorf("Users フォルダ直下へのインストールはサポートされていません")
		}
		if strings.Contains(path, "\\Program Files") {
			return fmt.Errorf("Program Files フォルダへのインストールはサポートされていません")
		}
	}

	// Check if path already exists and is not empty
	if info, err := os.Stat(path); err == nil {
		if info.IsDir() {
			files, _ := os.ReadDir(path)
			if len(files) > 0 {
				return fmt.Errorf("インストール先のフォルダが空ではありません")
			}
		}
	}

	// Try to create directory to validate write permissions
	if err := os.MkdirAll(path, 0755); err != nil {
		return fmt.Errorf("インストール先のフォルダを作成できませんでした: %w", err)
	}

	// Remove the test directory
	os.RemoveAll(path)

	return nil
}

// CreateDirectory creates a directory with the given path
func CreateDirectory(path string) error {
	return os.MkdirAll(path, 0755)
}

// CreateConfigFile creates a configuration file by copying and modifying the template
func CreateConfigFile(path string, config *ConfigData) error {
	// Template file path
	templatePath := filepath.Join(filepath.Dir(path), "config.yaml.example")
	
	// Read the template file
	data, err := os.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("テンプレートファイルの読み込みに失敗しました: %w", err)
	}

	content := string(data)

	// Replace placeholders with actual values
	content = strings.ReplaceAll(content, "8000", fmt.Sprintf("%d", config.Server.Port))
	content = strings.ReplaceAll(content, "your_jwt_secret_key_here", config.Server.JWTSecret)
	content = strings.ReplaceAll(content, "C:\\Users\\user\\Pictures\\Screenshots", config.Storage.CapturesDir)

	return os.WriteFile(path, []byte(content), 0644)
}

// GetPicturesDir returns the platform-specific pictures directory
func getPicturesDir() string {
	if runtime.GOOS == "windows" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "C:\\Users\\Public\\Pictures"
		}
		return filepath.Join(home, "Pictures")
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "/home/Pictures"
	}
	return filepath.Join(home, "Pictures")
}

// Install performs the installation
func Install(opts InstallOptions) error {
	// Validate installation path
	if err := ValidateInstallPath(opts.InstallPath); err != nil {
		return err
	}

	// Create installation directory
	if err := CreateDirectory(opts.InstallPath); err != nil {
		return fmt.Errorf("インストール先ディレクトリの作成に失敗しました: %w", err)
	}

	// Clone repository from GitHub
	if err := CloneRepository(opts.InstallPath); err != nil {
		return fmt.Errorf("リポジトリのクローンに失敗しました: %w", err)
	}

	// Create configuration file
	config := DefaultConfig()
	if opts.Port != 0 {
		config.Server.Port = opts.Port
	}
	if opts.JWTSecret != "" {
		config.Server.JWTSecret = opts.JWTSecret
	}
	if opts.StorageDir != "" {
		config.Storage.CapturesDir = opts.StorageDir
	}
	if opts.Host != "" {
		config.Server.Host = opts.Host
	}
	if opts.Schemes != "" {
		config.Server.Schemes = opts.Schemes
	}

	configPath := filepath.Join(opts.InstallPath, "server", "config.yaml")
	if err := CreateConfigFile(configPath, config); err != nil {
		return fmt.Errorf("設定ファイルの作成に失敗しました: %w", err)
	}

	return nil
}

// Uninstall removes the installation directory
func Uninstall(installPath string) error {
	if err := os.RemoveAll(installPath); err != nil {
		return fmt.Errorf("インストール先ディレクトリの削除に失敗しました: %w", err)
	}
	return nil
}

// CloneRepository clones the CommentPlayer repository from GitHub
func CloneRepository(installPath string) error {
	return CloneRepositoryWithVersion(installPath, "latest")
}

// CloneRepositoryWithVersion clones the CommentPlayer repository with a specific version
func CloneRepositoryWithVersion(installPath, version string) error {
	// GitHub repository URL
	repoURL := "https://github.com/hogecode/CommentPlayer.git"
	
	// Determine revision (branch or tag)
	// For 'latest', use custom-features branch; otherwise use version tag (e.g., v1.0.0)
	// revision = "v" + version
	
	// Create a temporary directory for cloning
	tempDir := filepath.Join(installPath, ".temp-clone")
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("一時ディレクトリの作成に失敗しました: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Clone repository with specific branch/tag
	cmd := exec.Command("git", "clone", /*"-b", revision,*/ repoURL, tempDir)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("CommentPlayer のソースコードのクローン中に予期しないエラーが発生しました: %w\nGit のエラーログ: %s", err, string(output))
	}

	// Copy cloned content to install path
	// We need to copy all files from tempDir to installPath
	if err := copyDirectory(tempDir, installPath); err != nil {
		return fmt.Errorf("ファイルのコピーに失敗しました: %w", err)
	}

	return nil
}

// copyDirectory recursively copies files from src to dst
func copyDirectory(src, dst string) error {
	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		// Skip .git directory and other unnecessary files
		if entry.Name() == ".git" || entry.Name() == ".github" || entry.Name() == ".gitignore" {
			continue
		}

		if entry.IsDir() {
			if err := os.MkdirAll(dstPath, 0755); err != nil {
				return err
			}
			if err := copyDirectory(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			// Read source file
			data, err := os.ReadFile(srcPath)
			if err != nil {
				return err
			}
			// Write to destination
			if err := os.WriteFile(dstPath, data, 0644); err != nil {
				return err
			}
		}
	}

	return nil
}

// GenerateJWTSecret generates a random JWT secret key
func GenerateJWTSecret() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		// Fallback to a default value if random generation fails
		return "your_jwt_secret_key_here_please_change_this"
	}
	return base64.StdEncoding.EncodeToString(b)
}

// GenerateConfigYAML generates config.yaml content by modifying the template file
func GenerateConfigYAML(serverPort, capturesDir string) string {
	jwtSecret := GenerateJWTSecret()
	
	// This function is maintained for backward compatibility
	// The actual config file creation uses CreateConfigFile which reads config.yaml.example
	// This string is not used but kept for reference
	return fmt.Sprintf("port: %s, captures_dir: %s, jwt_secret: %s", serverPort, capturesDir, jwtSecret)
}

// GenerateEnvLocal generates .env.local content by modifying the template file
func GenerateEnvLocal(serverPort string) string {
	// This function is maintained for backward compatibility
	// The actual .env.local file creation should use the template from apps/web/.env.local.example
	return fmt.Sprintf("VITE_API_BASE_URL=http://localhost:%s", serverPort)
}
