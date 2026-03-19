package dto

import (
	"time"
)

type Capture struct {

	// キャプチャID
	Id int32 `json:"id"`

	// ファイル名
	Filename string `json:"filename"`

	// 作成日時
	CreatedAt time.Time `json:"created_at"`

	// ビデオID（外部キー）
	VideoId int32 `json:"video_id"`
}
