package dto

type VideoResponse struct {

	// リクエスト成功フラグ
	IsSuccess bool `json:"is_success"`

	// ビデオソース（URL）
	Src string `json:"src"`

	// ビデオタイトル
	Title string `json:"title,omitempty"`

	// ビデオ説明
	Description string `json:"description,omitempty"`

	// 弾幕コメント一覧
	Comments []ApiComment `json:"comments"`
}
