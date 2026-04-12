package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/hogecode/CommentPlayer/installer/internal/ui"
	"github.com/hogecode/CommentPlayer/installer/internal/utils"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

// Error implements the error interface
func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// NewUpdateCommand creates the update command
func NewUpdateCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "update",
		Short: "CommentPlayer をアップデート",
		Long:  "CommentPlayer を最新バージョンにアップデートします。",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runUpdate()
		},
	}
}

func runUpdate() error {
	ui.PrintHeader("CommentPlayer アップデーター")
	ui.PrintLine()

	// アップデート対象のフォルダパスを取得
	ui.PrintSection("アップデート対象の CommentPlayer フォルダを入力してください")
	ui.PrintInfo("例: C:\\Users\\user\\CommentPlayer")

	installPath, err := promptPath(true)
	if err != nil {
		ui.PrintError(err.Error())
		return err
	}

	// フォルダの検証
	if err := validateCommentPlayerFolder(installPath); err != nil {
		ui.PrintError(err.Error())
		return err
	}

	// Git で更新
	ui.PrintSection("ソースコードを更新しています...")
	// Git pull を実行
	_, err = utils.RunCommand("git", "-C", installPath, "pull")
	if err != nil {
		ui.PrintWarning("Git での更新に失敗しました: " + err.Error())
	} else {
		ui.PrintSuccess("ソースコードを更新しました")
	}

	// サーバーフォルダで go mod download を実行
	ui.PrintSection("サーバーの依存パッケージをダウンロードしています...")
	serverDir := filepath.Join(installPath, "server")
	if _, err := utils.RunCommand("go", "-C", serverDir, "mod", "download"); err != nil {
		ui.PrintWarning("go mod download に失敗しました: " + err.Error())
	} else {
		ui.PrintSuccess("サーバーの依存パッケージをダウンロードしました")
	}

	// フロントエンド フォルダで npm install を実行
	ui.PrintSection("フロントエンドの依存パッケージをインストールしています...")
	webDir := filepath.Join(installPath, "apps", "web")
	if _, err := utils.RunCommand("npm", "install", "--prefix", webDir); err != nil {
		ui.PrintWarning("npm install に失敗しました: " + err.Error())
	} else {
		ui.PrintSuccess("フロントエンドの依存パッケージをインストールしました")
	}

	// フロントエンドの再ビルド（オプション）
	if ui.ConfirmAction("フロントエンドを再ビルドしますか？") {
		ui.PrintSection("フロントエンドを再ビルドしています...")
		if _, err := utils.RunCommand("npm", "run", "build", "--prefix", webDir); err != nil {
			ui.PrintWarning("npm run build に失敗しました: " + err.Error())
		} else {
			ui.PrintSuccess("フロントエンドを再ビルドしました")
		}
	}

	// アップデート完了
	ui.PrintLine()
	ui.PrintSuccess("CommentPlayer のアップデートが完了しました！")
	ui.PrintInfo("make server-dev コマンドでサーバーを起動してください")

	return nil
}

func validateCommentPlayerFolder(path string) error {
	// 主要なファイルの存在確認
	requiredFiles := []string{
		"README.md",
		"go.mod",
		"server/config.yaml.example",
		"apps/web/package.json",
	}

	for _, file := range requiredFiles {
		fullPath := filepath.Join(path, file)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			return &ValidationError{
				Field:   "インストールフォルダ",
				Message: "指定されたフォルダは CommentPlayer のフォルダではありません",
			}
		}
	}

	return nil
}

func promptPath(validateExistence bool) (string, error) {
	var path string
	for {
		fmt.Print("フォルダのパス: ")
		_, err := fmt.Scanln(&path)
		if err != nil {
			return "", fmt.Errorf("パスの入力に失敗しました")
		}

		path = filepath.Clean(path)

		if validateExistence {
			info, err := os.Stat(path)
			if err != nil {
				ui.PrintError("指定されたフォルダが存在しません。")
				continue
			}

			if !info.IsDir() {
				ui.PrintError("指定されたパスはフォルダではありません。")
				continue
			}
		}

		return path, nil
	}
}
