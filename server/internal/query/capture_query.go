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

// GetCapturesSeriesList - キャプチャが存在するシリーズ一覧を取得
// キャプチャが存在するシリーズのみをDISTINCTで取得し、作成日時の逆順でソート
func (q *CaptureQuery) GetCapturesSeriesList() ([]entity.Series, error) {
	var series []entity.Series
	// JOINを使ってキャプチャが存在するシリーズのみを取得
	if err := q.db.Distinct("series.*").
		Joins("JOIN video ON series.id = video.series_id").
		Joins("JOIN capture ON video.id = capture.video_id").
		Order("series.created_at DESC").
		Find(&series).Error; err != nil {
		return nil, err
	}
	return series, nil
}

// GetCapturesBySeriesParams - シリーズ別キャプチャ取得用パラメータ
type GetCapturesBySeriesParams struct {
	SeriesID  int64
	SortKey   string // "id" または "created_at"
	SortOrder string // "asc" または "desc"
	Limit     int64
	Offset    int64
}

// GetCapturesBySeries - 指定シリーズのキャプチャをソート付きで取得
// sortKey: "id" または "created_at"
// sortOrder: "asc" または "desc"
func (q *CaptureQuery) GetCapturesBySeries(params GetCapturesBySeriesParams) ([]entity.Capture, error) {
	var captures []entity.Capture
	
	// ソートキーとソート順序に基づいてORDER BY句を構築
	var orderBy string
	if params.SortKey == "id" {
		if params.SortOrder == "asc" {
			orderBy = "capture.id ASC"
		} else {
			orderBy = "capture.id DESC"
		}
	} else {
		// デフォルト：created_at
		if params.SortOrder == "asc" {
			orderBy = "capture.created_at ASC"
		} else {
			orderBy = "capture.created_at DESC"
		}
	}
	
	// JOINを使ってシリーズIDでフィルターしたキャプチャを取得
	if err := q.db.
		Joins("JOIN video ON capture.video_id = video.id").
		Where("video.series_id = ?", params.SeriesID).
		Order(orderBy).
		Limit(int(params.Limit)).
		Offset(int(params.Offset)).
		Find(&captures).Error; err != nil {
		return nil, err
	}
	return captures, nil
}

// CountCapturesBySeries - 指定シリーズのキャプチャ総数を取得
func (q *CaptureQuery) CountCapturesBySeries(seriesID int64) (int64, error) {
	var count int64
	if err := q.db.
		Joins("JOIN video ON capture.video_id = video.id").
		Where("video.series_id = ?", seriesID).
		Model(&entity.Capture{}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
