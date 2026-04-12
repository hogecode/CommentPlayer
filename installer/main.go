package main

import (
	"fmt"
	"os"

	"github.com/hogecode/CommentPlayer/installer/cmd"
)

func main() {
	// ダブルクリック実行時（引数なし）は自動的に install コマンドを実行
	if len(os.Args) == 1 {
		os.Args = append(os.Args, "install")
	}

	rootCmd := cmd.NewRootCommand()
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
