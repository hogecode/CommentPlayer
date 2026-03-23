package dto

import "time"

// FolderRequest - フォルダ追加リクエスト
type FolderRequest struct {
	Path string `json:"path" binding:"required"`
}

// FolderResponse - フォルダレスポンス
type FolderResponse struct {
	ID        int       `json:"id"`
	Path      string    `json:"path"`
	IsWatched bool      `json:"is_watched"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FolderListResponse - フォルダ一覧レスポンス
type FolderListResponse struct {
	Data []FolderResponse `json:"data"`
}

// FolderActionResponse - フォルダアクション（追加/削除）のレスポンス
type FolderActionResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    *FolderResponse `json:"data,omitempty"`
}
