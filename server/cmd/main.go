package main

import (
	"log"

	"github.com/hogecode/commentPlayer/internal/commands"
)

// @title commentPlayer API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host localhost:8000
// @BasePath /api/v1
func main() {
	if err := commands.RootCmd.Execute(); err != nil {
		log.Fatalf("Command execution failed: %v\n", err)
	}
}
