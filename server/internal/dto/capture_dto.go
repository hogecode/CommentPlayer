package dto

// import "github.com/hogecode/commentPlayer/internal/entity"

// CaptureList
// CaptureListRequest - キャプチャ一覧取得リクエスト
type CaptureListRequest struct {
	VideoID   int    `form:"video_id" validate:"omitempty,min=1"`
	SeriesID  int    `form:"series_id" validate:"omitempty,min=1"`
	Page      int    `form:"page" validate:"min=1"`
	Limit     int    `form:"limit" validate:"min=1,max=100"`
	SortKey   string `form:"sort_key" validate:"omitempty,oneof=id created_at"`
	SortOrder string `form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

// SetDefaults - デフォルト値を設定
func (c *CaptureListRequest) SetDefaults() {
	if c.Page == 0 {
		c.Page = 1
	}
	if c.Limit == 0 {
		c.Limit = 20
	}
	// ソートのデフォルト値（新しい順）
	if c.SortKey == "" {
		c.SortKey = "created_at"
	}
	if c.SortOrder == "" {
		c.SortOrder = "desc"
	}
}

// CaptureListResponse - キャプチャ一覧取得レスポンス
type CaptureListResponse struct {
	Data       []Capture  `json:"data"`
	Pagination Pagination `json:"pagination"`
}

// CapturesSeriesListResponse - キャプチャ対応シリーズ一覧レスポンス
type CapturesSeriesListResponse struct {
	Data []CaptureSeriesInfo `json:"data"`
}

// CaptureSeriesInfo - シリーズ情報（キャプチャ一覧で使用）
type CaptureSeriesInfo struct {
	ID                  int     `json:"id"`
	SeriesNameFile      string  `json:"series_name_file"`
	SyobocalTitleID     *int    `json:"syobocal_title_id"`
	SyobocalTitleName   *string `json:"syobocal_title_name"`
	SyobocalTitleNameEn *string `json:"syobocal_title_name_en"`
	FirstYear           *int    `json:"first_year"`
	FirstMonth          *int    `json:"first_month"`
}

// CaptureCreate
// CaptureCreateRequest - キャプチャ作成リクエスト
type CaptureCreateRequest struct {
	VideoID int `form:"video_id" validate:"required,min=1"`
	// File はMultipartForm で処理
}
