package dto

// Pagination - ページネーション情報
type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// ErrorResponse - エラーレスポンス
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}

// SuccessResponse - 成功レスポンス
type SuccessResponse struct {
	Message string `json:"message"`
}
