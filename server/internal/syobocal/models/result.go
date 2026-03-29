package models

// GetABCResult is the final output of getabc command
type GetABCResult struct {
	Title           string // TV series title
	Episode         int    // Episode number
	SubTitle        string // Episode subtitle
	Start           string // Broadcast start time in format "2006-01-02 15:04:05"
	RealStartTime   string // Actual program start time (based on ｷﾀ comment) in format "2006-01-02 15:04:05"
	A               string // A part start time in format "2006-01-02 15:04:05"
	B               string // B part start time in format "2006-01-02 15:04:05"
	C               string // C part start time in format "2006-01-02 15:04:05"
	ProgramFileName string // Program info file name
	ProgramContent  string // Program info file content
}
