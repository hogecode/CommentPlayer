package main

import (
	"log"

	"github.com/spf13/cobra"

	"github.com/hogecode/CommentVideo/internal/commands"
)

func main() {
	// ルートコマンドを定義
	rootCmd := &cobra.Command{
		Use:   "commentvideo",
		Short: "動画にコメントを流せるアプリ",
		Long:  "CommentVideo - 動画にコメントを流せるアプリ",
	}

	// サブコマンドを追加
	rootCmd.AddCommand(commands.ServeCmd)

	// コマンドを実行
	if err := rootCmd.Execute(); err != nil {
		log.Fatalf("Command execution failed: %v\n", err)
	}
}
