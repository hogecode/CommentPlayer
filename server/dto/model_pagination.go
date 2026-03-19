package dto

type Pagination struct {

	// 現在のページ番号
	Page int32 `json:"page"`

	// 1ページあたりのアイテム数
	Limit int32 `json:"limit"`

	// 総アイテム数
	Total int32 `json:"total"`

	// 総ページ数
	TotalPages int32 `json:"total_pages"`
}
