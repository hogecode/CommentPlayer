package entity

import "time"

// Mylist - マイリストエンティティ
// ユーザーが好きな動画をマイリストに追加できる
type Mylist struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	UserID    int       `gorm:"index" json:"user_id"`        // Userテーブルへの外部キー
	VideoID   int       `gorm:"index" json:"video_id"`       // Videoテーブルへの外部キー
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// リレーション
	User  *User  `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	Video *Video `gorm:"foreignKey:VideoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
}

// TableName - テーブル名指定
func (Mylist) TableName() string {
	return "mylist"
}
