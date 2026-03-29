package entity

import "time"

// Series - シリーズエンティティ
type Series struct {
	ID                int        `gorm:"primaryKey" json:"id"`
	SeriesNameFile    string     `json:"series_name_file" gorm:"uniqueIndex"` // {title} 部分
	SyobocalTitleID   *int       `json:"syobocal_title_id"`
	SyobocalTitleName *string    `json:"syobocal_title_name"`
	SyobocalTitleNameEn *string  `json:"syobocal_title_name_en"`
	Comment           *string    `json:"comment"`
	FirstYear         *int       `json:"first_year"`
	FirstMonth        *int       `json:"first_month"`
	FirstEndYear      *int       `json:"first_end_year"`
	FirstEndMonth     *int       `json:"first_end_month"`
	Subtitles         *string    `json:"subtitles"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// TableName - テーブル名指定
func (Series) TableName() string {
	return "series"
}
