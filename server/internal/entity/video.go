package entity

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// ThumbnailInfo - サムネイル情報
type ThumbnailInfo struct {
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	GeneratedAt time.Time `json:"generated_at"`
}

// Video - ビデオエンティティ
type Video struct {
	ID                 int             `gorm:"primaryKey" json:"id"`
	FileName           string          `json:"file_name"`
	FolderID           int             `json:"folder_id"` // Folderテーブルへの外部キー
	SeriesID           *int            `json:"series_id"` // Seriesテーブルへの外部キー
	Episode            *int            `json:"episode"`   // エピソード番号
	Subtitle           *string         `json:"subtitle"`  // エピソードサブタイトル
	FilePath           string          `json:"-"`
	Description        *string         `json:"description"`
	Status             string          `json:"status"` // ready, processing, error
	FileHash           string          `json:"-"`      // 非公開
	FileSize           int64           `json:"file_size"`
	JikkyoCommentCount *int            `json:"jikkyo_comment_count"`
	JikkyoDate         *time.Time      `json:"jikkyo_date"`
	Views              int             `json:"views"`
	Liked              bool            `json:"liked"`
	ScreenshotFilePath *string         `json:"screenshot_file_path"`
	Duration           float64         `json:"duration"`
	ThumbnailInfoJSON  json.RawMessage `gorm:"type:json" json:"-"`
	ThumbnailInfo      *ThumbnailInfo  `gorm:"-" json:"thumbnail_info"`
	IsDeleted          bool            `json:"is_deleted"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

// Scan - JSON フィールドの読み込み
func (v *Video) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion failed")
	}
	if err := json.Unmarshal(bytes, &v.ThumbnailInfo); err != nil {
		return err
	}
	return nil
}

// Value - JSON フィールドの書き込み
func (v *Video) Value() (driver.Value, error) {
	if v.ThumbnailInfo == nil {
		return nil, nil
	}
	return json.Marshal(v.ThumbnailInfo)
}

// TableName - テーブル名指定
func (Video) TableName() string {
	return "video"
}

// BeforeSave - 保存前フック（ThumbnailInfo を JSON に変換）
func (v *Video) BeforeSave(tx *gorm.DB) error {
	if v.ThumbnailInfo != nil {
		data, err := json.Marshal(v.ThumbnailInfo)
		if err != nil {
			return err
		}
		v.ThumbnailInfoJSON = data
	}
	return nil
}

// AfterFind - 読み込み後フック（JSON から ThumbnailInfo に変換）
func (v *Video) AfterFind(tx *gorm.DB) error {
	if len(v.ThumbnailInfoJSON) > 0 {
		if err := json.Unmarshal(v.ThumbnailInfoJSON, &v.ThumbnailInfo); err != nil {
			return err
		}
	}
	return nil
}
