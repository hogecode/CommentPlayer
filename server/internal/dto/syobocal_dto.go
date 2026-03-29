package dto

// SyobocalTitleSearchRequest - Syobocal タイトル検索リクエスト
type SyobocalTitleSearchRequest struct {
	Title string `json:"title" binding:"required"`
}

// SyobocalTitleSearchResponse - Syobocal タイトル検索レスポンス
type SyobocalTitleSearchResponse struct {
	Total  int                     `json:"total"`
	Titles []SyobocalTitleResponse `json:"titles"`
}

// SyobocalTitleResponse - Syobocal タイトル情報
type SyobocalTitleResponse struct {
	TID           string `json:"tid"`           // Title ID
	Title         string `json:"title"`         // タイトル名
	ShortTitle    string `json:"short_title"`   // 短いタイトル
	TitleEN       string `json:"title_en"`      // 英語タイトル
	Comment       string `json:"comment"`       // コメント
	FirstYear     string `json:"first_year"`    // 初回放送年
	FirstMonth    string `json:"first_month"`   // 初回放送月
	FirstEndYear  *int `json:"first_end_year"`  // 最終放送年
	FirstEndMonth *int `json:"first_end_month"` // 最終放送月
}

// SyobocalSaveTitleRequest - Syobocal タイトルを Series に保存するリクエスト
// フロント → バックエンドAPI → Syobocal API → バックエンド → フロント
type SyobocalSaveTitleRequest struct {
	TID      string `json:"tid" binding:"required"`       // Syobocal TID (Title ID)
	Title    string `json:"title" binding:"required"`     // タイトル名
	SeriesID int    `json:"series_id" binding:"required"` // シリーズID
}

// SyobocalSaveTitleResponse - Syobocal タイトル保存レスポンス
type SyobocalSaveTitleResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	SeriesID int   `json:"series_id"`
}

// SyobocalErrorResponse - エラーレスポンス
type SyobocalErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
