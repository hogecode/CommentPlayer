package dto

import (
	"time"
)

type Video struct {

	// ビデオID
	Id int32 `json:"id"`

	// ファイル名
	FileName string `json:"file_name"`

	// ビデオステータス
	Status string `json:"status,omitempty"`

	// ファイルサイズ（バイト）
	FileSize int32 `json:"file_size"`

	// 実況コメント数
	JikkyoCommentCount int32 `json:"jikkyo_comment_count,omitempty"`

	// 実況日時
	JikkyoDate time.Time `json:"jikkyo_date,omitempty"`

	// 閲覧数
	Views int32 `json:"views"`

	// お気に入りフラグ
	Liked bool `json:"liked"`

	// 動画長（秒）
	Duration float64 `json:"duration"`

	// 作成日時
	CreatedAt time.Time `json:"created_at"`

	// 更新日時
	UpdatedAt time.Time `json:"updated_at"`

	ThumbnailInfo ThumbnailInfo `json:"thumbnail_info,omitempty"`
}
