package commands

import "github.com/spf13/cobra"

// RootCmd - ルートコマンド
var RootCmd = &cobra.Command{
	Use:   "commentPlayer",
	Short: "動画にコメントを流せるアプリ",
	Long:  "commentPlayer - 動画にコメントを流せるアプリ",
}

func init() {
	// RootCmdにサブコマンドを追加
	RootCmd.AddCommand(ServeCmd)
	RootCmd.AddCommand(DBCmd)

	// DBCmdにサブコマンドを追加
	DBCmd.AddCommand(DBMigrateCmd)
}
