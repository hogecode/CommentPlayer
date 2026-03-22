package entity

import "time"

// Folder - フォルダエンティティ
type Folder struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Path      string    `json:"path" gorm:"uniqueIndex"`
	IsWatched bool      `json:"is_watched" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName - テーブル名指定
func (Folder) TableName() string {
	return "folder"
}
