package ui

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// InstallForm represents the installation form UI
type InstallForm struct {
	currentStep int
	inputs      []textinput.Model
	focusIndex  int
	submitted   bool
	data        map[string]string
	fieldNames  []string
	fieldErrors map[string]string
}

// NewInstallForm creates a new installation form
func NewInstallForm() *InstallForm {
	form := &InstallForm{
		currentStep: 0,
		inputs:      make([]textinput.Model, 0),
		fieldNames:  make([]string, 0),
		data:        make(map[string]string),
		fieldErrors: make(map[string]string),
	}

	// Initialize inputs for each step without default values
	form.addInputField("installPath", "インストール先パス (例: C:\\CommentPlayer):", true)
	form.addInputField("serverPort", "サーバーポート (例: 8000):", false)
	form.addInputField("capturesDir", "キャプチャ保存先 (例: C:\\Users\\<ユーザー名>\\Pictures):", true)

	// Focus on the first input
	if len(form.inputs) > 0 {
		form.inputs[0].Focus()
	}

	return form
}

// addInputField adds a new input field to the form
// Fields are mandatory and user must provide input
func (f *InstallForm) addInputField(key, placeholder string, isPath bool) {
	input := textinput.New()
	input.Placeholder = placeholder
	input.CharLimit = 512 // Increase character limit for file paths
	
	f.fieldNames = append(f.fieldNames, key)
	f.inputs = append(f.inputs, input)
	f.data[key] = ""
	f.fieldErrors[key] = ""
}

// ValidateCurrentField validates the current input field
func (f *InstallForm) ValidateCurrentField() bool {
	key := f.fieldNames[f.focusIndex]
	value := f.inputs[f.focusIndex].Value()

	if value == "" {
		f.fieldErrors[key] = "このフィールドは必須です"
		return false
	}

	// Validate field-specific rules
	switch key {
	case "installPath":
		if len(value) < 3 {
			f.fieldErrors[key] = "パスが短すぎます"
			return false
		}
		// Validate that the path format is valid and can be created
		absPath := filepath.Clean(value)
		// TODO: 存在するフォルダかどうか判定
		if !isValidInstallPath(absPath) {
			f.fieldErrors[key] = "パスが無効です (絶対パスを指定してください)"
			return false
		}
		f.fieldErrors[key] = ""
	case "serverPort":
		// Port number should be numeric and between 1024 and 65535
		port := 0
		if _, err := fmt.Sscanf(value, "%d", &port); err != nil || port < 1024 || port > 65535 {
			f.fieldErrors[key] = "ポート番号は1024～65535の数値である必要があります"
			return false
		}
		f.fieldErrors[key] = ""
	case "capturesDir":
		if len(value) < 3 {
			f.fieldErrors[key] = "パスが短すぎます"
			return false
		}
		// Validate that the directory exists and is readable
		if !isValidCapturesDir(value) {
			f.fieldErrors[key] = "ディレクトリが存在しないか、アクセス権限がありません"
			return false
		}
		f.fieldErrors[key] = ""
	}

	return true
}

// isValidInstallPath checks if a path is valid for installation
func isValidInstallPath(path string) bool {
	// Check if path is absolute
	if !filepath.IsAbs(path) {
		return false
	}

	// Check if path has a valid volume name (drive letter for Windows)
	if filepath.VolumeName(path) == "" {
		return false
	}

	// Path format validation passed
	// Actual directory creation and validation will happen during installation
	return true
}

// isValidCapturesDir checks if a directory exists and is accessible
func isValidCapturesDir(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}

	// Check if it's a directory
	if !info.IsDir() {
		return false
	}

	// Try to create a test file to verify write permissions
	testFile := filepath.Join(path, ".test_write_permission")
	if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
		return false
	}
	os.Remove(testFile)

	return true
}

// Init initializes the form
func (f *InstallForm) Init() tea.Cmd {
	if len(f.inputs) > 0 {
		return textinput.Blink
	}
	return nil
}

// Update handles updates to the form
func (f *InstallForm) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c":
			return f, tea.Quit
		case "up":
			if f.focusIndex > 0 {
				// Unfocus current field
				f.inputs[f.focusIndex].Blur()
				f.focusIndex--
				// Focus new field
				f.inputs[f.focusIndex].Focus()
				// Clear error message when switching fields
				f.fieldErrors[f.fieldNames[f.focusIndex]] = ""
			}
			return f, nil
		case "down":
			if f.focusIndex < len(f.inputs)-1 {
				// Unfocus current field
				f.inputs[f.focusIndex].Blur()
				f.focusIndex++
				// Focus new field
				f.inputs[f.focusIndex].Focus()
				// Clear error message when switching fields
				f.fieldErrors[f.fieldNames[f.focusIndex]] = ""
			}
			return f, nil
		case "enter":
			// Validate current field before moving to next
			if !f.ValidateCurrentField() {
				return f, nil
			}
			
			// Store current input value
			key := f.fieldNames[f.focusIndex]
			f.data[key] = f.inputs[f.focusIndex].Value()
			
			// Check if all fields are completed
			if f.focusIndex == len(f.inputs)-1 {
				f.submitted = true
				// Quit the program after form submission
				return f, tea.Quit
			}
			
			// Unfocus current field
			f.inputs[f.focusIndex].Blur()
			// Move to next field
			f.focusIndex++
			// Focus new field
			f.inputs[f.focusIndex].Focus()
			return f, nil
		default:
			// For all other key inputs, update the focused input
			updatedInput, cmd := f.inputs[f.focusIndex].Update(msg)
			f.inputs[f.focusIndex] = updatedInput
			return f, cmd
		}
	}

	return f, nil
}

// View renders the form
func (f *InstallForm) View() string {
	if f.submitted {
		return StyleSuccess.Render("✓ 設定が完了しました")
	}

	s := "\n"
	s += StyleTitle.Render("📋 CommentPlayer インストール設定") + "\n\n"

	content := fmt.Sprintf("ステップ %d/%d\n\n", f.focusIndex+1, len(f.inputs))
	content += renderInputFieldsWithValidation(f.inputs, f.fieldNames, f.fieldErrors, f.focusIndex)

	s += StyleBox.Render(content)

	s += "\n" + StyleSubtitle.Render("上下キーでフィールド移動、Enter で次へ進む (Ctrl+C で終了)\n")

	return s
}

// renderInputFieldsWithValidation renders all input fields with error messages
func renderInputFieldsWithValidation(inputs []textinput.Model, fieldNames []string, fieldErrors map[string]string, focusIndex int) string {
	s := ""
	for i, input := range inputs {
		if i == focusIndex {
			// Show focused field with indicator
			s += "➜ " + input.View() + "\n"
			
			// Show error if validation failed
			if fieldErrors[fieldNames[i]] != "" {
				s += StyleWarning.Render("⚠ " + fieldErrors[fieldNames[i]]) + "\n"
			}
		} else {
			// Show non-focused fields in gray
			s += lipgloss.NewStyle().Foreground(lipgloss.Color("240")).Render("  " + input.View()) + "\n"
		}
		s += "\n"
	}
	return s
}

// getKeyByIndex gets the key for the input at the given index
func getKeyByIndex(index int) string {
	keys := []string{"installPath", "serverPort", "capturesDir"}
	if index < len(keys) {
		return keys[index]
	}
	return ""
}

// GetData returns the form data
func (f *InstallForm) GetData() map[string]string {
	return f.data
}

// IsSubmitted returns whether the form has been submitted
func (f *InstallForm) IsSubmitted() bool {
	return f.submitted
}
