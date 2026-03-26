package dto

import (
	"time"

	"github.com/hogecode/commentPlayer/internal/entity"
)

// MylistRequest - マイリスト追加/削除リクエスト
type MylistRequest struct {
	VideoID int `json:"video_id" binding:"required"`
}

// MylistResponse - マイリストレスポンス
type MylistResponse struct {
	ID        int       `json:"id"`
	VideoID   int       `json:"video_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// MylistWithVideoResponse - 動画情報を含むマイリストレスポンス
type MylistWithVideoResponse struct {
	ID        int            `json:"id"`
	VideoID   int            `json:"video_id"`
	Video     *entity.Video  `json:"video"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

// MylistListResponse - マイリスト一覧レスポンス
type MylistListResponse struct {
	Data       []MylistWithVideoResponse `json:"data"`
	Pagination Pagination                `json:"pagination"`
}
