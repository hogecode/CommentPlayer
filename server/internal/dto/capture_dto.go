package dto

import "github.com/hogecode/commentPlayer/internal/entity"

// CaptureList
// CaptureListRequest - キャプチャ一覧取得リクエスト
type CaptureListRequest struct {
	VideoID int `form:"video_id" validate:"omitempty,min=1"`
	Page    int `form:"page" validate:"min=1"`
	Limit   int `form:"limit" validate:"min=1,max=100"`
}

// SetDefaults - デフォルト値を設定
func (c *CaptureListRequest) SetDefaults() {
	if c.Page == 0 {
		c.Page = 1
	}
	if c.Limit == 0 {
		c.Limit = 20
	}
}

// CaptureListResponse - キャプチャ一覧取得レスポンス
type CaptureListResponse struct {
	Data       []entity.Capture `json:"data"`
	Pagination Pagination       `json:"pagination"`
}

// CaptureCreate
// CaptureCreateRequest - キャプチャ作成リクエスト
type CaptureCreateRequest struct {
	VideoID int `form:"video_id" validate:"required,min=1"`
	// File はMultipartForm で処理
}
