package dto

import (
	"time"
)

type ThumbnailInfo struct {

	// サムネイル幅
	Width int32 `json:"width,omitempty"`

	// サムネイル高さ
	Height int32 `json:"height,omitempty"`

	// 生成日時
	GeneratedAt time.Time `json:"generated_at,omitempty"`
}
