package models

// TitleSearchResponse is the response from Syoboi TitleSearch API
type TitleSearchResponse struct {
	Titles map[string]Title `json:"Titles"`
}

// Title represents a TV title from TitleSearch API
type Title struct {
	TID           string `json:"TID"`
	Title         string `json:"Title"`
	ShortTitle    string `json:"ShortTitle"`
	TitleYomi     string `json:"TitleYomi"`
	TitleEN       string `json:"TitleEN"`
	Cat           string `json:"Cat"`
	FirstCh       string `json:"FirstCh"`       // Channel name (string)
	FirstYear     string `json:"FirstYear"`
	FirstMonth    string `json:"FirstMonth"`
	FirstEndYear  *string `json:"FirstEndYear"` // Can be null
	FirstEndMonth *string `json:"FirstEndMonth"` // Can be null
	TitleFlag     string `json:"TitleFlag"`
	Comment       string `json:"Comment"`
	Search        int    `json:"Search"`
	Programs      []Program `json:"Programs"` // Optional programs
}

// TitleLookupResponse is the response from Syoboi TitleLookup API
type TitleLookupResponse struct {
	Result      Result       `xml:"Result"`
	TitleItems  []TitleItem  `xml:"TitleItems>TitleItem"`
}

// Result represents the result status from TitleLookup API
type Result struct {
	Code    int    `xml:"Code"`
	Message string `xml:"Message"`
}

// TitleItem represents a title item from TitleLookup API
type TitleItem struct {
	ID            string `xml:"id,attr"`
	TID           string `xml:"TID"`
	LastUpdate    string `xml:"LastUpdate"`
	Title         string `xml:"Title"`
	ShortTitle    string `xml:"ShortTitle"`
	TitleYomi     string `xml:"TitleYomi"`
	TitleEN       string `xml:"TitleEN"`
	Comment       string `xml:"Comment"`
	Cat           string `xml:"Cat"`
	TitleFlag     string `xml:"TitleFlag"`
	FirstYear     string `xml:"FirstYear"`
	FirstMonth    string `xml:"FirstMonth"`
	FirstEndYear  string `xml:"FirstEndYear"`
	FirstEndMonth string `xml:"FirstEndMonth"`
	FirstCh       string `xml:"FirstCh"`
	Keywords      string `xml:"Keywords"`
	UserPoint     string `xml:"UserPoint"`
	UserPointRank string `xml:"UserPointRank"`
	SubTitles     string `xml:"SubTitles"`
}
