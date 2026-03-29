package models

// Channel represents TV channel information
type Channel struct {
	ChID     int    // Channel ID (1-20)
	ChGID    int    // Channel Group ID
	ChName   string // Channel name (Japanese)
	JikkyoID string // Jikkyo API ID (e.g., "jk1", "jk7")
}

// ChannelMapping maps channel names to channel objects
type ChannelMapping map[string]*Channel
