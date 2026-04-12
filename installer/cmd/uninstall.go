package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/hogecode/CommentPlayer/installer/internal/ui"
)

// NewUninstallCommand creates the uninstall command
func NewUninstallCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "uninstall",
		Short: "CommentPlayer をアンインストール",
		Long:  "CommentPlayer をシステムから完全に削除します。",
		RunE:  runUninstall,
	}
}

func runUninstall(cmd *cobra.Command, args []string) error {
	// Display header
	ui.PrintHeader("CommentPlayer アンインストーラー")

	// Get installation path from user
	installPath, err := getUninstallPath()
	if err != nil {
		return err
	}

	// Validate installation path
	if err := validateInstallationFolder(installPath); err != nil {
		ui.PrintError(fmt.Sprintf("インストール先のフォルダ検証に失敗しました: %v", err))
		return err
	}

	// Display confirmation
	ui.PrintWarning("\nCommentPlayer サーバーに保存されているすべてのユーザーデータが削除されます。")
	ui.PrintWarning("もとに戻すことはできません。本当に CommentPlayer をアンインストールしますか？")

	// Get user confirmation
	confirmed := ui.ConfirmAction("CommentPlayer のアンインストール")
	if !confirmed {
		ui.PrintInfo("CommentPlayer のアンインストールをキャンセルしました。")
		return nil
	}

	// Show progress
	ui.PrintInfo("\n削除を実行しています...")

	// Delete installation directory
	if err := os.RemoveAll(installPath); err != nil {
		ui.PrintError(fmt.Sprintf("インストール先ディレクトリの削除に失敗しました: %v", err))
		return err
	}

	// Success message
	ui.PrintSuccess("\nCommentPlayer のアンインストールが完了しました。")
	ui.PrintInfo("今まで利用していただきありがとうございました!")

	return nil
}

func getUninstallPath() (string, error) {
	ui.PrintSection("01. アンインストール対象の CommentPlayer のフォルダのパスを入力してください。")
	ui.PrintInfo("例: C:\\CommentPlayer")

	var installPath string
	for {
		fmt.Print("\nアンインストール対象の CommentPlayer のフォルダのパス: ")
		_, err := fmt.Scanln(&installPath)
		if err != nil {
			return "", fmt.Errorf("パスの入力に失敗しました")
		}

		// Validate input
		if strings.TrimSpace(installPath) == "" {
			ui.PrintError("パスを入力してください。")
			continue
		}

		// Check if path exists
		info, err := os.Stat(installPath)
		if err != nil {
			ui.PrintError("指定されたフォルダが存在しません。")
			continue
		}

		if !info.IsDir() {
			ui.PrintError("指定されたパスはフォルダではありません。")
			continue
		}

		return installPath, nil
	}
}

func validateInstallationFolder(path string) error {
	// Check required files and directories
	requiredItems := []string{
		"server",
		"server/config.yaml.example",
	}

	for _, item := range requiredItems {
		itemPath := filepath.Join(path, item)
		if _, err := os.Stat(itemPath); err != nil {
			return fmt.Errorf("必須アイテム %s が見つかりません", item)
		}
	}

	return nil
}
