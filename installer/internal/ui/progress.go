package ui

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
)

// ProgressModel represents the progress UI
type ProgressModel struct {
	percent float64
	done    bool
	message string
}

// NewProgressModel creates a new progress model
func NewProgressModel() *ProgressModel {
	return &ProgressModel{
		percent: 0.0,
		done:    false,
		message: "準備中...",
	}
}

// Init initializes the progress model
func (p *ProgressModel) Init() tea.Cmd {
	return nil
}

// Update handles updates to the progress model
func (p *ProgressModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c":
			return p, tea.Quit
		}
	case progressMsg:
		p.percent = msg.percent
		p.message = msg.message
		if msg.percent >= 1.0 {
			p.done = true
		}
	}
	return p, nil
}

// View renders the progress model
func (p *ProgressModel) View() string {
	if p.done {
		return StyleSuccess.Render("✓ インストール完了！") + "\n"
	}

	return fmt.Sprintf(
		"\n%s\n\n[%-50s] %.0f%%\n\n%s\n",
		StyleTitle.Render("⏳ CommentPlayer をインストール中..."),
		"==============================================",
		p.percent*100,
		p.message,
	)
}

// progressMsg is a message for progress updates
type progressMsg struct {
	percent float64
	message string
}

// SetProgress updates the progress
func (p *ProgressModel) SetProgress(percent float64, message string) tea.Cmd {
	return func() tea.Msg {
		return progressMsg{percent: percent, message: message}
	}
}
