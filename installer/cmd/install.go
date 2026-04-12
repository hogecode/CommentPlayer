package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

	// Step 1: OS check and system information display
	if err := showSystemInfo(); err != nil {
		return fmt.Errorf("システム情報の表示に失敗しました: %w", err)
	}

	// ------------------------------------------
	// インストールフォーム
	// ------------------------------------------
	// Step 2: Display installation form
	fmt.Println("次のフォームに必要な情報を入力してください。")
	fmt.Println("これらの情報は後で`server.config.yaml`で変更可能です。")
	fmt.Println(ui.StyleWarning.Render("インストール先のパス区切り文字は '\\\\' です。"))
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


	// ------------------------------------------
	// GitHubからダウンロード
	// ------------------------------------------
	// Step 6: Clone repository from GitHub
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("📥 ソースコードをダウンロードしています..."))

	// Check if git is installed
	if !utils.CommandExists("git") {
		return fmt.Errorf("Git がインストールされていません。CommentPlayer をインストールするには Git が必要です")
	}

	// Clone repository with version (using 'latest' as default)
	cloneVersion := "latest"  // TODO: Version detection from config or environment
	if err := installer.CloneRepositoryWithVersion(installPath, cloneVersion); err != nil {
		return err
	}

	fmt.Println(ui.StyleSuccess.Render(fmt.Sprintf("✓ ソースコードをダウンロードしました: %s", installPath)))

	// Step 7: Download and extract thirdparty tools
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("📦 サードパーティーライブラリをダウンロードしています..."))

	/*
	// TODO: リリースからダウンロードURLを取得する関数を実装して、最新のリリースからダウンロードするようにする
	toolsTempPath := filepath.Join(os.TempDir(), "thirdparty-tools.tar.gz")
	version := "v0.1.1" // TODO: Version detection from config or environment
	toolsDownloadURL := utils.GetGitHubReleaseDownloadURL("hogecode", "CommentPlayer", version, "thirdparty-tools.tar.gz")
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
	*/


	// ------------------------------------------
	// 設定ファイルの生成
	// ------------------------------------------
	// Step 8: Create configuration
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("📝 設定ファイルを生成しています..."))

	configPath := filepath.Join(installPath, "server", "config.yaml")
	if err := generateConfigFile(configPath, installData); err != nil {
		return fmt.Errorf("サーバーの設定ファイルの生成に失敗しました: %w", err)
	}

	// Step 9: Create .env.local file for frontend
	envLocalPath := filepath.Join(installPath, "apps", "web", ".env.local")
	if err := generateEnvLocal(envLocalPath, serverPortStr); err != nil {
		return fmt.Errorf(".env.local ファイルの生成に失敗しました: %w", err)
	}


	// ------------------------------------------
	// ビルドの実行
	// ------------------------------------------
	// Step 10: Build Web and Server
	fmt.Println()
	fmt.Println(ui.StyleSubtitle.Render("🔨 ビルドを実行しています..."))

	// Get the installation path (should be installPath)
	projectRoot := installPath

	// Run make setup-dev
	fmt.Println()
	fmt.Println(ui.StyleBox.Render("📦 開発環境をセットアップ中..."))
	if err := utils.RunCommandWithCwd(projectRoot, "make", "setup-dev"); err != nil {
		fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ make setup-dev の実行に失敗しました: %v", err)))
		fmt.Println(ui.StyleBox.Render("手動でセットアップするには、インストール先で以下を実行してください:\n  make setup-dev"))
	} else {
		fmt.Println(ui.StyleSuccess.Render("✓ 開発環境をセットアップしました"))
	}

	// Run make web-build
	fmt.Println()
	fmt.Println(ui.StyleBox.Render("🌐 Webをビルド中..."))
	if err := utils.RunCommandWithCwd(projectRoot, "make", "web-build"); err != nil {
		fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ make web-build の実行に失敗しました: %v", err)))
		fmt.Println(ui.StyleBox.Render("手動でビルドするには、インストール先で以下を実行してください:\n  make web-build"))
	} else {
		fmt.Println(ui.StyleSuccess.Render("✓ Webをビルドしました"))
	}

	// Run make server-build
	fmt.Println()
	fmt.Println(ui.StyleBox.Render("🖥️ サーバーをビルド中..."))
	if err := utils.RunCommandWithCwd(projectRoot, "make", "server-build"); err != nil {
		fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ make server-build の実行に失敗しました: %v", err)))
		fmt.Println(ui.StyleBox.Render("手動でビルドするには、インストール先で以下を実行してください:\n  make server-build"))
	} else {
		fmt.Println(ui.StyleSuccess.Render("✓ サーバーをビルドしました"))
	}


	// ------------------------------------------
	// インストール完了
	// ------------------------------------------
	// Step 11: Display completion message
	fmt.Println()
	fmt.Println(ui.StyleSuccess.Render("✅ CommentPlayer のインストールが完了しました！"))
	fmt.Println()
	fmt.Println(ui.StyleBox.Render(
		fmt.Sprintf("インストール先: %s\nサーバーポート: %d\n"+
			"キャプチャ保存先: %s\n\n"+
			"アクセスURL: http://localhost:%d\n\n"+
			"ブラウザで http://localhost:%d にアクセスしてください\n",
			installPath, serverPort, capturesDir, serverPort, serverPort)))

	// 20秒待機した後に、make start-dev を実行してサーバーを起動
	fmt.Println()
	fmt.Println(ui.StyleBox.Render("⏳ 20秒後にサーバーを起動します..."))
	time.Sleep(20 * time.Second)

	fmt.Println()
	fmt.Println(ui.StyleBox.Render("🚀 サーバーを起動中..."))
	if err := utils.RunCommandWithCwd(projectRoot, "make", "start-dev"); err != nil {
		fmt.Println(ui.StyleWarning.Render(fmt.Sprintf("⚠ make start-dev の実行に失敗しました: %v", err)))
		fmt.Println(ui.StyleBox.Render("手動でサーバーを起動するには、インストール先で以下を実行してください:\n  make start-dev"))
	} else {
		fmt.Println(ui.StyleSuccess.Render("✓ サーバーを起動しました"))
	}

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

// generateConfigFile generates the config.yaml file by using the template
func generateConfigFile(configPath string, installData map[string]string) error {
	// Ensure directory exists
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	serverPort := installData["serverPort"]
	capturesDir := installData["capturesDir"]

	// Template file path - config.yaml.example should be in the server directory
	// After cloning, the path will be installPath/server/config.yaml.example
	installPath := filepath.Dir(filepath.Dir(configPath)) // Go up two levels from server/config.yaml to installPath
	templatePath := filepath.Join(installPath, "server", "config.yaml.example")
	
	// Read the template file
	data, err := os.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("テンプレートファイルの読み込みに失敗しました (%s): %w", templatePath, err)
	}

	content := string(data)

	// Replace placeholders with actual values
	// Replace port
	content = strings.ReplaceAll(content, "port: 8000", fmt.Sprintf("port: %s", serverPort))
	
	// Replace JWT secret with a generated one
	jwtSecret := installer.GenerateJWTSecret()
	content = strings.ReplaceAll(content, "your_jwt_secret_key_here", jwtSecret)
	
	// Replace captures directory
	content = strings.ReplaceAll(content, "C:\\\\Users\\\\user\\\\Pictures\\\\Screenshots", capturesDir)

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
	templatePath := filepath.Join(envDir, ".env.local.example")
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
