package dto

type ThumbnailRegenerateResponse struct {

	// ビデオID
	Id int32 `json:"id"`

	ThumbnailInfo ThumbnailInfo `json:"thumbnail_info"`

	// ステータスメッセージ
	Message string `json:"message"`
}
