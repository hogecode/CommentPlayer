package cmd

import (
	"github.com/spf13/cobra"
)

// NewRootCommand creates the root command for the installer
func NewRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "commentplayer-installer",
		Short: "CommentPlayer インストーラー",
		Long:  "CommentPlayer をセットアップするためのインストーラーツールです。",
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Help()
		},
	}

	// サブコマンドを追加
	cmd.AddCommand(NewInstallCommand())
	cmd.AddCommand(NewUninstallCommand())
	cmd.AddCommand(NewUpdateCommand())

	return cmd
}
