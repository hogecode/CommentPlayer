package utils

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// ValidateInstallPath validates an installation path
func ValidateInstallPath(path string) error {
	// Check if path is absolute
	if !filepath.IsAbs(path) {
		return fmt.Errorf("インストール先のフォルダは絶対パスで入力してください")
	}

	// Check for invalid characters
	if strings.Contains(path, "#") {
		return fmt.Errorf("インストール先のパスには # を含めないでください")
	}

	// Try to create the directory
	err := os.MkdirAll(path, 0755)
	if err != nil {
		return fmt.Errorf("インストール先のフォルダを作成できませんでした: %w", err)
	}

	// Check if directory is empty (if it exists)
	entries, err := os.ReadDir(path)
	if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("フォルダへのアクセスに失敗しました: %w", err)
	}

	if len(entries) > 0 {
		return fmt.Errorf("インストール先のフォルダが空ではありません")
	}

	return nil
}

// ValidateFolderPath validates a folder path (used for recording folders)
func ValidateFolderPath(path string) error {
	// Check if path is absolute
	if !filepath.IsAbs(path) {
		return fmt.Errorf("フォルダは絶対パスで入力してください")
	}

	// Check if path exists
	stat, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("指定されたフォルダが存在しません")
		}
		return fmt.Errorf("フォルダへのアクセスに失敗しました: %w", err)
	}

	// Check if it's a directory
	if !stat.IsDir() {
		return fmt.Errorf("指定されたパスはフォルダではありません")
	}

	return nil
}

// ValidateURL validates a URL format
func ValidateURL(urlStr string, scheme string) error {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return fmt.Errorf("URL が不正です: %w", err)
	}

	if parsedURL.Scheme != scheme {
		return fmt.Errorf("URL のスキームが不正です (期待: %s, 実際: %s)", scheme, parsedURL.Scheme)
	}

	if parsedURL.Hostname() == "" {
		return fmt.Errorf("URL 内にホスト名が指定されていません")
	}

	return nil
}

// ValidatePort validates a port number
func ValidatePort(port int) error {
	if port < 1 || port > 65535 {
		return fmt.Errorf("ポート番号は 1 から 65535 の間である必要があります")
	}
	return nil
}

// ValidateJWTSecret validates JWT secret
func ValidateJWTSecret(secret string) error {
	if len(secret) < 32 {
		return fmt.Errorf("JWT シークレットは最低 32 文字である必要があります")
	}
	return nil
}

// IsValidHostname validates a hostname
func IsValidHostname(hostname string) bool {
	// Simple validation for hostname
	pattern := `^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$`
	matched, _ := regexp.MatchString(pattern, hostname)
	return matched || hostname == "localhost" || isValidIP(hostname)
}

// isValidIP checks if a string is a valid IP address
func isValidIP(ip string) bool {
	parts := strings.Split(ip, ".")
	if len(parts) != 4 {
		return false
	}

	for _, part := range parts {
		if part == "" {
			return false
		}

		// Check if part is a valid number between 0-255
		var num int
		_, err := fmt.Sscanf(part, "%d", &num)
		if err != nil || num < 0 || num > 255 {
			return false
		}
	}

	return true
}

// NormalizeURL normalizes a URL (adds trailing slash, replaces localhost)
func NormalizeURL(urlStr string) string {
	// Add trailing slash if not present
	if !strings.HasSuffix(urlStr, "/") {
		urlStr += "/"
	}

	// Replace localhost with 127.0.0.1 for better performance
	urlStr = strings.ReplaceAll(urlStr, "localhost", "127.0.0.1")

	return urlStr
}
