package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"

	"github.com/hogecode/CommentPlayer/installer/internal/installer"
	"github.com/hogecode/CommentPlayer/installer/internal/ui"
	"github.com/hogecode/CommentPlayer/installer/internal/utils"
)

// NewInstallCommand creates the install command
func NewInstallCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "install",
		Short: "CommentPlayer をインストール",
		Long:  "CommentPlayer をシステムにインストールし、セットアップを行います。",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runInstall(cmd)
		},
	}
}

func runInstall(cmd *cobra.Command) error {
	// Display introduction
	fmt.Println()
	fmt.Println(ui.StyleTitle.Render("🚀 CommentPlayer インストーラへようこそ！"))
	fmt.Println()
	fmt.Println("このツールは CommentPlayer をお使いのシステムにインストールします。")
	fmt.Println()

	// Step 1: Show system information
	if err := showSystemInfo(); err != nil {
		return fmt.Errorf("システム情報の表示に失敗しました: %w", err)
	}

	// Step 2: Display installation form
	form := ui.NewInstallForm()
	p := tea.NewProgram(form)

	finalModel, err := p.Run()
	if err != nil {
		return fmt.Errorf("インストールフォームの実行に失敗しました: %w", err)
	}

	installForm := finalModel.(*ui.InstallForm)
	if !installForm.IsSubmitted() {
		fmt.Println(ui.StyleWarning.Render("⚠ インストールはキャンセルされました。"))
		return nil
	}

	installData := installForm.GetData()
	fmt.Println()

	// Step 3: Validate installation path
	installPath := installData["installPath"]
	if err := validateAndCreateInstallPath(installPath); err != nil {
		return fmt.Errorf("インストールパスの検証に失敗しました: %w", err)
	}

	// Step 4: Validate and create directories
	capturesDir := installData["capturesDir"]
	if err := validateDirectory(capturesDir, "キャプチャ保存先"); err != nil {
		return err
	}

	// Step 5: Validate server port
	serverPortStr := installData["serverPort"]
	serverPort, err := strconv.Atoi(serverPortStr)
	if err := utils.ValidatePort(serverPort); err != nil {
		return err
	}

	// TODO: git clone を実行してリポジトリをインストール先にクローンする処理を追加
	
	// Step 6: Download and extract winget tools
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("📦 サードパーティーライブラリをダウンロードしています..."))
	
	// Get the latest release version (or use a specific version)
	version := "latest"  // TODO: Version detection from git tag or config
	toolsDownloadURL := utils.GetGitHubReleaseDownloadURL("hogecode", "CommentPlayer", version, "winget-tools.tar.gz")
	
	toolsTempPath := filepath.Join(os.TempDir(), "winget-tools.tar.gz")
	if _, err := utils.DownloadFile(toolsDownloadURL, toolsTempPath); err != nil {
		// Continue without tools if download fails (tools are optional)
		fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ サードパーティーライブラリのダウンロードに失敗しました: %v", err)))
	} else {
		// Extract tools to installation directory
		toolsExtractPath := filepath.Join(installPath, "thirdparty")
		if err := utils.ExtractTarGz(toolsTempPath, toolsExtractPath); err != nil {
			fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ ツールの展開に失敗しました: %v", err)))
		} else {
			fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ サードパーティーライブラリを展開しました: %s", toolsExtractPath)))
		}
		
		// Clean up temporary file
		_ = os.Remove(toolsTempPath)
	}
	
	// Step 7: Create configuration
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("📝 設定ファイルを生成しています..."))

	configPath := filepath.Join(installPath, "server", "config.yaml")
	if err := generateConfigFile(configPath, installData); err != nil {
		return fmt.Errorf("設定ファイルの生成に失敗しました: %w", err)
	}

	// Step 7: Create .env.local file for frontend
	envLocalPath := filepath.Join(installPath, "apps", "web", ".env.local")
	if err := generateEnvLocal(envLocalPath, serverPortStr); err != nil {
		return fmt.Errorf(".env.local ファイルの生成に失敗しました: %w", err)
	}

	// Step 8: Display completion message
	fmt.Println()
	fmt.Println(ui.StyleSuccess.Render("✅ CommentPlayer のインストールが完了しました！"))
	fmt.Println()
	fmt.Println(ui.StyleBox.Render(
		fmt.Sprintf("インストール先: %s\nサーバーポート: %s\n"+
			"キャプチャ保存先: %s\n\n"+
			"次のステップ:\n"+
			"1. インストール先フォルダに移動\n"+
			"2. 'make setup-dev' コマンドを実行\n"+
			"3. 'make server-dev' でサーバーを起動\n",
			installPath, serverPort, capturesDir)))

	return nil
}

// showSystemInfo displays system information
func showSystemInfo() error {
	fmt.Println(ui.StyleSubtitle.Render("ℹ️ システム情報"))

	osName := getOSName()
	fmt.Printf("OS: %s\n", osName)

	if !strings.HasPrefix(osName, "Windows") {
		return fmt.Errorf("このインストーラーは Windows でのみサポートされています")
	}

	fmt.Println()
	return nil
}

// validateAndCreateInstallPath validates and creates the installation path
func validateAndCreateInstallPath(installPath string) error {
	// Convert to absolute path
	absPath, err := filepath.Abs(installPath)
	if err != nil {
		return fmt.Errorf("パスの解析に失敗しました: %w", err)
	}

	// Check if path is absolute
	if !filepath.IsAbs(absPath) {
		return fmt.Errorf("インストール先は絶対パスである必要があります")
	}

	// Check for invalid characters
	if strings.Contains(absPath, "#") {
		return fmt.Errorf("インストール先のパスに # を含めることはできません")
	}

	// Check if directory already exists and is not empty
	if info, err := os.Stat(absPath); err == nil {
		if info.IsDir() {
			// Check if directory is empty
			entries, err := os.ReadDir(absPath)
			if err != nil {
				return fmt.Errorf("ディレクトリの確認に失敗しました: %w", err)
			}
			if len(entries) > 0 {
				return fmt.Errorf("インストール先ディレクトリが空ではありません。別の場所を指定してください")
			}
		}
	}

	// Create directory
	if err := os.MkdirAll(absPath, 0755); err != nil {
		return fmt.Errorf("インストール先ディレクトリの作成に失敗しました: %w", err)
	}

	fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ インストール先を作成しました: %s", absPath)))
	return nil
}

// validateDirectory validates that a directory exists
func validateDirectory(dirPath, name string) error {
	info, err := os.Stat(dirPath)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("%sが存在しません", name)
		}
		return fmt.Errorf("%sの確認に失敗しました: %w", name, err)
	}

	if !info.IsDir() {
		return fmt.Errorf("%sはディレクトリではありません", name)
	}

	fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ %s: %s", name, dirPath)))
	return nil
}

// generateConfigFile generates the config.yaml file
func generateConfigFile(configPath string, installData map[string]string) error {
	// Ensure directory exists
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	serverPort := installData["serverPort"]
	capturesDir := installData["capturesDir"]

	// Generate config content
	content := installer.GenerateConfigYAML(serverPort, capturesDir)

	if err := os.WriteFile(configPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("ファイルの書き込みに失敗しました: %w", err)
	}

	fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ 設定ファイルを生成しました: %s", configPath)))
	return nil
}

// generateEnvLocal generates the .env.local file for frontend by copying and modifying the template
func generateEnvLocal(envPath string, serverPort string) error {
	// Ensure directory exists
	envDir := filepath.Dir(envPath)
	if err := os.MkdirAll(envDir, 0755); err != nil {
		return fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	// Template file path (relative to the cloned repository)
	templatePath := filepath.Join(filepath.Dir(envDir), ".env.local.example")
	
	// Read the template file
	data, err := os.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("テンプレートファイルの読み込みに失敗しました: %w", err)
	}

	content := string(data)

	// Replace port placeholders with actual values
	content = strings.ReplaceAll(content, "8000", serverPort)
	content = strings.ReplaceAll(content, "localhost:8000", fmt.Sprintf("localhost:%s", serverPort))

	if err := os.WriteFile(envPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("ファイルの書き込みに失敗しました: %w", err)
	}

	fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ フロントエンド設定を生成しました: %s", envPath)))
	return nil
}

// getOSName returns the OS name
func getOSName() string {
	return os.Getenv("OS")
}
