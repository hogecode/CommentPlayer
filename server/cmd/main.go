package main

import (
	"log"

	"github.com/hogecode/commentPlayer/internal/commands"
)

func main() {
	if err := commands.RootCmd.Execute(); err != nil {
		log.Fatalf("Command execution failed: %v\n", err)
	}
}
