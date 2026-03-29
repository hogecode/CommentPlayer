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
type SyobocalSaveTitleRequest struct {
	TID               string  `json:"tid" binding:"required"`                  // Syobocal TID (Title ID)
	SyobocalTitleID   int     `json:"syobocal_title_id" binding:"required"`   // Syobocal Title ID
	SyobocalTitleName string  `json:"syobocal_title_name" binding:"required"` // Syobocal Title Name
	SeriesID          *int    `json:"series_id"`                              // シリーズID（既存シリーズの場合）
	TitleNameEN       *string `json:"title_name_en"`                          // 英語タイトル
	Comment           string  `json:"comment"`                                // コメント（XML形式）
	FirstYear         *int    `json:"first_year"`                             // 初回放送年
	FirstMonth        *int    `json:"first_month"`                            // 初回放送月
	FirstEndYear      *int    `json:"first_end_year"`                         // 最終放送年
	FirstEndMonth     *int    `json:"first_end_month"`                        // 最終放送月
	Subtitles         string  `json:"subtitles"`                              // サブタイトル（XML形式）
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
