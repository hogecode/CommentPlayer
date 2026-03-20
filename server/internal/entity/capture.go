package entity

import (
	"time"
)

// Capture - キャプチャエンティティ
type Capture struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Filename  string    `json:"filename"`
	VideoID   int       `json:"video_id"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName - テーブル名指定
func (Capture) TableName() string {
	return "capture"
}
