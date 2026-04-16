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
	Thread    string      `json:"thread"`
	No        string      `json:"no"`
	Vpos      string      `json:"vpos"`
	Date      interface{} `json:"date"` // Unix timestamp (can be string or int)
	Mail      string      `json:"mail"`
	UserID    string      `json:"user_id"`
	Premium   string      `json:"premium"`
	Anonymity string      `json:"anonymity"`
	DateUsec  string      `json:"date_usec"`
	Content   string      `json:"content"`
}

// Jikkyo XML Types

// JikkyoPacketXML is the XML packet response from Jikkyo API
type JikkyoPacketXML struct {
	Chats []JikkiyoChatXML `xml:"chat"`
}

// JikkiyoChatXML represents a comment/chat from the broadcast in XML format
type JikkiyoChatXML struct {
	Thread    string `xml:"thread,attr"`
	No        string `xml:"no,attr"`
	Vpos      string `xml:"vpos,attr"`
	Date      string `xml:"date,attr"` // Unix timestamp
	DateUsec  string `xml:"date_usec,attr"`
	Mail      string `xml:"mail,attr"`
	UserID    string `xml:"user_id,attr"`
	Premium   string `xml:"premium,attr"`
	Anonymity string `xml:"anonymity,attr"`
	Content   string `xml:",chardata"`
}

// CommentAnalysis contains the analysis of broadcast marker comments (ｷﾀ, A, B, C)
type CommentAnalysis struct {
	KitaTime int64 // Unix timestamp of ｷﾀ comment
	ATime    int64 // Unix timestamp of A comment
	BTime    int64 // Unix timestamp of B comment
	CTime    int64 // Unix timestamp of C comment
}
