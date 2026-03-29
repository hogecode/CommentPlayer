package entity

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// Series - シリーズエンティティ
type Series struct {
	ID                int            `gorm:"primaryKey" json:"id"`
	SeriesNameFile    string         `json:"series_name_file" gorm:"uniqueIndex"` // {title} 部分
	SyobocalTitleID   *int           `json:"syobocal_title_id"`
	SyobocalTitleName *string        `json:"syobocal_title_name"`
	SyobocalTitleNameEn *string      `json:"syobocal_title_name_en"`
	Comment           JSONMap        `json:"comment" gorm:"type:json"`
	FirstYear         *int           `json:"first_year"`
	FirstMonth        *int           `json:"first_month"`
	FirstEndYear      *int           `json:"first_end_year"`
	FirstEndMonth     *int           `json:"first_end_month"`
	Subtitles         JSONArray      `json:"subtitles" gorm:"type:json"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

// JSONMap - JSON型を表すカスタム型（map用）
type JSONMap map[string]interface{}

// Value - Gorm DBWriterインターフェース実装
func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan - Gorm DBScannerインターフェース実装
func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONMap)
		return nil
	}

	bytes, _ := value.([]byte)
	return json.Unmarshal(bytes, &j)
}

// JSONArray - JSON型を表すカスタム型（配列用）
type JSONArray []map[string]interface{}

// Value - Gorm DBWriterインターフェース実装
func (j JSONArray) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan - Gorm DBScannerインターフェース実装
func (j *JSONArray) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONArray, 0)
		return nil
	}

	bytes, _ := value.([]byte)
	return json.Unmarshal(bytes, &j)
}

// TableName - テーブル名指定
func (Series) TableName() string {
	return "series"
}
