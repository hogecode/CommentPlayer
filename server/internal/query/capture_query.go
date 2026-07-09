package query

import (
	"github.com/hogecode/commentPlayer/internal/entity"
	"gorm.io/gorm"
)

// CaptureQuery - キャプチャ関連のクエリ
type CaptureQuery struct {
	db *gorm.DB
}

// NewCaptureQuery - CaptureQuery を初期化
func NewCaptureQuery(db *gorm.DB) *CaptureQuery {
	return &CaptureQuery{db: db}
}


// CreateCapture - キャプチャを作成
func (q *CaptureQuery) CreateCapture(capture *entity.Capture) error {
	return q.db.Create(capture).Error
}

// GetCaptureByID - IDでキャプチャを取得
func (q *CaptureQuery) GetCaptureByID(id int) (*entity.Capture, error) {
	var capture entity.Capture
	if err := q.db.First(&capture, id).Error; err != nil {
		return nil, err
	}
	return &capture, nil
}

// UpdateCapture - キャプチャを更新
func (q *CaptureQuery) UpdateCapture(capture *entity.Capture) error {
	return q.db.Save(capture).Error
}

// DeleteCapture - キャプチャを削除
func (q *CaptureQuery) DeleteCapture(id int) error {
	return q.db.Delete(&entity.Capture{}, id).Error
}
