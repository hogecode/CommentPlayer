package dto

type ThumbnailRegenerateRequest struct {

	// サムネイル幅
	Width int32 `json:"width,omitempty"`

	// サムネイル高さ
	Height int32 `json:"height,omitempty"`

	// 抽出タイムスタンプ（秒）
	Timestamp float32 `json:"timestamp,omitempty"`
}
