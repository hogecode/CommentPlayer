package entity

import (
	"encoding/json"
	"time"
)

// User - ユーザーエンティティ
type User struct {
	ID                     int             `gorm:"primaryKey" json:"id"`
	Name                   string          `json:"name"`
	Password               string          `json:"-"` // 非公開
	IsAdmin                int             `json:"is_admin"`
	ClientSettingsJSON     json.RawMessage `gorm:"type:json" json:"-"`
	ClientSettings         map[string]interface{} `gorm:"-" json:"client_settings"`
	NiconicoUserID         *int            `json:"niconico_user_id"`
	NiconicoUserName       *string         `json:"niconico_user_name"`
	NiconicoUserPremium    *int            `json:"niconico_user_premium"`
	NiconicoAccessToken    *string         `json:"-"` // 非公開
	NiconicoRefreshToken   *string         `json:"-"` // 非公開
	CreatedAt              time.Time       `json:"created_at"`
	UpdatedAt              time.Time       `json:"updated_at"`
}

// TableName - テーブル名指定
func (User) TableName() string {
	return "users"
}
