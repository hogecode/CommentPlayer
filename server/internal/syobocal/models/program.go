package models

// Program represents a TV program broadcast
type Program struct {
	PID         string `json:"PID"`
	TID         string `json:"TID"`
	StTime      string `json:"StTime"`   // Unix timestamp as string
	EdTime      string `json:"EdTime"`   // Unix timestamp as string
	ChID        string `json:"ChID"`
	StOffset    string `json:"StOffset"`
	Count       *string `json:"Count"`   // Can be null
	ProgComment string `json:"ProgComment"`
	SubTitle    string `json:"SubTitle"`
	ChName      string `json:"ChName"`
}

// ProgLookupResponse is the response from Syoboi ProgLookup API (XML)
type ProgLookupResponse struct {
	ProgItems []ProgItem `xml:"ProgItems>ProgItem"`
	Result    ProgResult `xml:"Result"`
}

// ProgItem represents a single program item from ProgLookup API
type ProgItem struct {
	ID           string `xml:"id,attr"`
	LastUpdate   string `xml:"LastUpdate"`
	PID          string `xml:"PID"`
	TID          string `xml:"TID"`
	StTime       string `xml:"StTime"`       // e.g., "2021-01-28 19:30:00"
	EdTime       string `xml:"EdTime"`       // e.g., "2021-01-28 20:00:00"
	StOffset     string `xml:"StOffset"`
	Count        string `xml:"Count"`
	SubTitle     string `xml:"SubTitle"`
	ProgComment  string `xml:"ProgComment"`
	Flag         string `xml:"Flag"`
	Deleted      int    `xml:"Deleted"`      // 0 = not deleted, use first non-deleted item
	Warn         string `xml:"Warn"`
	ChID         string `xml:"ChID"`
	Revision     string `xml:"Revision"`
	STSubTitle   string `xml:"STSubTitle"`   // Episode subtitle
}

// ProgResult contains the API response result code
type ProgResult struct {
	Code    string `xml:"Code"`
	Message string `xml:"Message"`
}
