package dto

import "github.com/hogecode/commentPlayer/internal/entity"

// ---ApiComment---
// DPlayer形式のコメント（ニコニコ形式をDPlayer形式に変換）
type ApiComment struct {
	Time   float64 `json:"time" validate:"required,min=0"`   // コメント表示時刻（秒）
	Type   string  `json:"type" validate:"required,oneof=right top bottom"` // コメント位置
	Size   string  `json:"size" validate:"required,oneof=big medium small"` // コメントサイズ
	Color  string  `json:"color" validate:"required"`         // コメント色（16進数カラーコード）
	Author *string `json:"author"`                            // コメント投稿者ID（匿名の場合はnil）
	Text   string  `json:"text" validate:"required"`          // コメント本文
}

// ---VideoList---
// VideoListRequest - ビデオ一覧取得リクエスト
type VideoListRequest struct {
	IDs      []int  `form:"ids" validate:"dive,min=1"`
	FilterBy string `form:"filterBy"`
	Year     *int   `form:"year"`  // 年フィルター（例：2023）
	Page     int    `form:"page" validate:"min=1"`
	Limit    int    `form:"limit" validate:"min=1,max=100"`
	Sort     string `form:"sort" validate:"oneof=created_at views file_name duration jikkyo_date"`
	Order    string `form:"order" validate:"oneof=asc desc"`
}

// SetDefaults - デフォルト値を設定
func (v *VideoListRequest) SetDefaults() {
	if v.Page == 0 {
		v.Page = 1
	}
	if v.Limit == 0 {
		v.Limit = 20
	}
	if v.Sort == "" {
		v.Sort = "created_at"
	}
	if v.Order == "" {
		v.Order = "desc"
	}
}

// VideoListResponse - ビデオ一覧取得レスポンス
type VideoListResponse struct {
	Data       []entity.Video `json:"data"`
	Pagination Pagination     `json:"pagination"`
}

// VideoSearch
// VideoSearchRequest - ビデオ検索リクエスト
type VideoSearchRequest struct {
	Q        string `form:"q" validate:"required,min=1"`
	Page     int    `form:"page" validate:"min=1"`
	Limit    int    `form:"limit" validate:"min=1,max=100"`
	Order    string `form:"order" validate:"oneof=asc desc"`
	FilterBy string `form:"filterBy"`
}

// SetDefaults - デフォルト値を設定
func (v *VideoSearchRequest) SetDefaults() {
	if v.Page == 0 {
		v.Page = 1
	}
	if v.Limit == 0 {
		v.Limit = 20
	}
	if v.Order == "" {
		v.Order = "desc"
	}
}

// ---Video---
// VideoResponse - ビデオ詳細レスポンス
type VideoResponse struct {
	IsSuccess   bool         `json:"is_success"`
	Src         string       `json:"src"`
	Title       *string      `json:"title"`
	Description *string      `json:"description"`
	Comments    []ApiComment `json:"comments"`
}

// ---ThumbnailRegenerate---
// ThumbnailRegenerateRequest - サムネイル再生成リクエスト
type ThumbnailRegenerateRequest struct {
	Width     *int     `json:"width" validate:"omitempty,min=1"`
	Height    *int     `json:"height" validate:"omitempty,min=1"`
	Timestamp *float64 `json:"timestamp" validate:"omitempty,min=0"`
}

// ThumbnailRegenerateResponse - サムネイル再生成レスポンス
type ThumbnailRegenerateResponse struct {
	ID            int                   `json:"id"`
	ThumbnailInfo *entity.ThumbnailInfo `json:"thumbnail_info"`
	Message       string                `json:"message"`
}

// ---VideoYears---
// VideoYearsResponse - ビデオの年一覧レスポンス
type VideoYearsResponse struct {
	Data []int `json:"data"`
}
