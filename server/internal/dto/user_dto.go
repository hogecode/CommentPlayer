package dto

import "github.com/hogecode/commentPlayer/internal/entity"

// UserCreateRequest - ユーザー作成リクエスト
type UserCreateRequest struct {
	Username        string `json:"username" binding:"required,min=1"`
	Password        string `json:"password" binding:"required,min=1"`
	ConfirmPassword string `json:"confirm_password" binding:"required,min=1"`
}

// UserAccessTokenRequest - アクセストークン発行リクエスト（OAuth2準拠）
type UserAccessTokenRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserAccessToken - アクセストークンレスポンス
type UserAccessToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

// UserUpdateRequest - ユーザー情報更新リクエスト
type UserUpdateRequest struct {
	Username *string `json:"username"`
	Password *string `json:"password"`
}

// UserUpdateRequestForAdmin - ユーザー情報更新リクエスト（管理者用）
type UserUpdateRequestForAdmin struct {
	IsAdmin *bool `json:"is_admin"`
}

// UserResponse - ユーザーレスポンス
type UserResponse struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	IsAdmin      int    `json:"is_admin"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// UsersResponse - ユーザー一覧レスポンス
type UsersResponse struct {
	Data []entity.User `json:"data"`
}
