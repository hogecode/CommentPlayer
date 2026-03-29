package models

// JikkyoResponse is the response from Jikkyo API
type JikkyoResponse struct {
	Packets []JikkyoPacket `json:"packet"`
}

// JikkyoPacket contains a single chat message from Jikkyo
type JikkyoPacket struct {
	Chat JikkyoChat `json:"chat"`
}

// JikkyoChat represents a comment/chat from the broadcast
type JikkyoChat struct {
	Thread     string      `json:"thread"`
	No         string      `json:"no"`
	Vpos       string      `json:"vpos"`
	Date       interface{} `json:"date"`       // Unix timestamp (can be string or int)
	Mail       string      `json:"mail"`
	UserID     string      `json:"user_id"`
	Premium    string      `json:"premium"`
	Anonymity  string      `json:"anonymity"`
	DateUsec   string      `json:"date_usec"`
	Content    string      `json:"content"`
}

// CommentAnalysis contains the analysis of broadcast marker comments (ｷﾀ, A, B, C)
type CommentAnalysis struct {
	KitaTime int64 // Unix timestamp of ｷﾀ comment
	ATime    int64 // Unix timestamp of A comment
	BTime    int64 // Unix timestamp of B comment
	CTime    int64 // Unix timestamp of C comment
}
