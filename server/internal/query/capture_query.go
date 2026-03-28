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

// GetCaptureList - キャプチャ一覧を取得
func (q *CaptureQuery) GetCaptureList(videoID, page, limit int) ([]entity.Capture, int64, error) {
	query := q.db

	// VideoID でフィルター
	if videoID > 0 {
		query = query.Where("video_id = ?", videoID)
	}

	// 合計数を取得
	var total int64
	if err := query.Model(&entity.Capture{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// ページネーション
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// データ取得
	var captures []entity.Capture
	if err := query.Find(&captures).Error; err != nil {
		return nil, 0, err
	}

	return captures, total, nil
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
