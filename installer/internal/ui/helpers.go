package ui

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// PrintHeader prints the header message
func PrintHeader(message string) {
	fmt.Println()
	fmt.Println(StyleTitle.Render(message))
	fmt.Println()
}

// PrintSection prints a section header
func PrintSection(message string) {
	fmt.Println()
	fmt.Println(StyleSubtitle.Render(message))
}

// PrintError prints an error message
func PrintError(message string) {
	fmt.Println(StyleError.Render("❌ " + message))
}

// PrintSuccess prints a success message
func PrintSuccess(message string) {
	fmt.Println(StyleSuccess.Render("✅ " + message))
}

// PrintWarning prints a warning message
func PrintWarning(message string) {
	fmt.Println(StyleWarning.Render("⚠️  " + message))
}

// PrintInfo prints an info message
func PrintInfo(message string) {
	fmt.Println(message)
}

// ConfirmAction asks user for confirmation
func ConfirmAction(action string) bool {
	reader := bufio.NewReader(os.Stdin)
	prompt := fmt.Sprintf("%s [y/N]: ", action)
	fmt.Print(prompt)

	input, err := reader.ReadString('\n')
	if err != nil {
		return false
	}

	response := strings.TrimSpace(strings.ToLower(input))
	return response == "y" || response == "yes"
}

// PrintBox prints a message in a styled box
func PrintBox(message string) {
	fmt.Println(StyleBox.Render(message))
}

// PrintLine prints a horizontal line
func PrintLine() {
	fmt.Println(lipgloss.NewStyle().Foreground(ColorPrimary).Render(strings.Repeat("─", 50)))
}
