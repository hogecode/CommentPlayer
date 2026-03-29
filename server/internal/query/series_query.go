package query

import (
	"fmt"

	"github.com/hogecode/commentPlayer/internal/entity"
	"gorm.io/gorm"
)

// SeriesQuery - シリーズクエリ
type SeriesQuery struct {
	db *gorm.DB
}

// NewSeriesQuery - SeriesQueryを新規作成
func NewSeriesQuery(db *gorm.DB) *SeriesQuery {
	return &SeriesQuery{db: db}
}

// GetByID - IDでシリーズを取得
func (sq *SeriesQuery) GetByID(id int) (*entity.Series, error) {
	var series entity.Series
	if err := sq.db.First(&series, id).Error; err != nil {
		return nil, fmt.Errorf("failed to find series: %w", err)
	}
	return &series, nil
}

// GetByName - シリーズ名でシリーズを取得
func (sq *SeriesQuery) GetByName(name string) (*entity.Series, error) {
	var series entity.Series
	if err := sq.db.Where("series_name_file = ?", name).First(&series).Error; err != nil {
		return nil, fmt.Errorf("failed to find series: %w", err)
	}
	return &series, nil
}

// GetAll - すべてのシリーズを取得
func (sq *SeriesQuery) GetAll() ([]entity.Series, error) {
	var series []entity.Series
	if err := sq.db.Order("series_name_file ASC").Find(&series).Error; err != nil {
		return nil, fmt.Errorf("failed to find series: %w", err)
	}
	return series, nil
}

// GetAllWithCount - シリーズとビデオ数を取得
func (sq *SeriesQuery) GetAllWithCount() ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	if err := sq.db.Model(&entity.Series{}).
		Select("series.*, COUNT(video.id) as video_count").
		Joins("LEFT JOIN video ON series.id = video.series_id AND video.is_deleted = ?", false).
		Group("series.id").
		Order("series.series_name_file ASC").
		Scan(&results).Error; err != nil {
		return nil, fmt.Errorf("failed to find series with count: %w", err)
	}
	return results, nil
}

// Create - シリーズを作成
func (sq *SeriesQuery) Create(series *entity.Series) error {
	if err := sq.db.Create(series).Error; err != nil {
		return fmt.Errorf("failed to create series: %w", err)
	}
	return nil
}

// Update - シリーズを更新
func (sq *SeriesQuery) Update(series *entity.Series) error {
	if err := sq.db.Save(series).Error; err != nil {
		return fmt.Errorf("failed to update series: %w", err)
	}
	return nil
}

// Delete - シリーズを削除
func (sq *SeriesQuery) Delete(id int) error {
	if err := sq.db.Delete(&entity.Series{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete series: %w", err)
	}
	return nil
}

// GetVideosForSeries - シリーズのビデオを取得
func (sq *SeriesQuery) GetVideosForSeries(seriesID int) ([]entity.Video, error) {
	var videos []entity.Video
	if err := sq.db.Where("series_id = ? AND is_deleted = ?", seriesID, false).
		Order("file_name ASC").
		Find(&videos).Error; err != nil {
		return nil, fmt.Errorf("failed to find videos for series: %w", err)
	}
	return videos, nil
}
