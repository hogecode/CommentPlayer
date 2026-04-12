package utils

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
)

// RunCommand executes a shell command and returns stdout/stderr
func RunCommand(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return string(output), fmt.Errorf("コマンド実行に失敗しました (%s): %w\n出力: %s", name, err, string(output))
	}
	return string(output), nil
}

// RunCommandWithOutput executes a command and returns output
func RunCommandWithOutput(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	output, err := cmd.Output()
	if err != nil {
		return string(output), fmt.Errorf("コマンド実行に失敗しました (%s): %w", name, err)
	}
	return string(output), nil
}

// CommandExists checks if a command exists in PATH
func CommandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// OpenURLInBrowser opens a URL in the default browser
func OpenURLInBrowser(url string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	default:
		return fmt.Errorf("対応していないプラットフォーム: %s", runtime.GOOS)
	}

	return cmd.Start()
}

// GetPlatform returns the current platform type
func GetPlatform() string {
	switch runtime.GOOS {
	case "windows":
		return "Windows"
	case "linux":
		return "Linux"
	case "darwin":
		return "Darwin"
	default:
		return "Unknown"
	}
}

// GetArchitecture returns the current architecture
func GetArchitecture() string {
	switch runtime.GOARCH {
	case "amd64":
		return "x86_64"
	case "arm64":
		return "arm64"
	case "386":
		return "i386"
	case "arm":
		return "armv7"
	default:
		return runtime.GOARCH
	}
}

// GetBinaryName returns the appropriate binary name for the current platform
func GetBinaryName(baseName string) string {
	if runtime.GOOS == "windows" {
		return baseName + ".exe"
	}
	return baseName
}

// IsRunningAsAdmin checks if the application is running with admin/root privileges
func IsRunningAsAdmin() bool {
	switch runtime.GOOS {
	case "windows":
		_, err := os.Open("\\\\.\\PHYSICALDRIVE0")
		return err == nil
	case "linux", "darwin":
		return os.Geteuid() == 0
	default:
		return false
	}
}

// RequireAdmin returns an error if not running with admin/root privileges
func RequireAdmin() error {
	if !IsRunningAsAdmin() {
		switch runtime.GOOS {
		case "windows":
			return fmt.Errorf("このアプリケーションは管理者権限で実行する必要があります")
		case "linux", "darwin":
			return fmt.Errorf("このアプリケーションは root 権限で実行する必要があります")
		}
	}
	return nil
}

// GetHomeDirectory returns the home directory path
func GetHomeDirectory() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("ホームディレクトリの取得に失敗しました: %w", err)
	}
	return home, nil
}

// GetCurrentDirectory returns the current working directory
func GetCurrentDirectory() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("カレントディレクトリの取得に失敗しました: %w", err)
	}
	return dir, nil
}
