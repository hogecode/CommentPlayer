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
