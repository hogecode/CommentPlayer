package entity

import "time"

// WatchedHistory - 動画視聴履歴エンティティ
type WatchedHistory struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	VideoID   int       `json:"video_id"`   // Video テーブルへの外部キー
	WatchedAt time.Time `json:"watched_at"` // 視聴開始時刻
}

// TableName - テーブル名指定
func (WatchedHistory) TableName() string {
	return "watched_history"
}
