package service

import (
	"fmt"
	"log/slog"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/entity"
	"gorm.io/gorm"
)

// SeriesService - シリーズサービス
type SeriesService struct {
	db     *gorm.DB
	config *config.Config
}

// NewSeriesService - SeriesServiceを新規作成
func NewSeriesService(db *gorm.DB, cfg *config.Config) *SeriesService {
	return &SeriesService{
		db:     db,
		config: cfg,
	}
}

// SeriesMatch - シリーズマッチング結果
type SeriesMatch struct {
	SeriesName string
	EpisodeNum string
}

// ExtractSeriesFromFileName - ファイル名からシリーズ情報を抽出
func (ss *SeriesService) ExtractSeriesFromFileName(fileName string) *SeriesMatch {
	// ファイル拡張子を除去
	baseFileName := GetBaseFileName(fileName)

	// 設定されたパターンをすべて試す
	for _, pattern := range ss.config.Series.Patterns {
		match := ss.matchPattern(baseFileName, pattern)
		if match != nil {
			return match
		}
	}

	return nil
}

// matchPattern - パターンマッチング処理
func (ss *SeriesService) matchPattern(fileName string, pattern string) *SeriesMatch {
	// パターンを正規表現に変換
	// {title} と {episode} をキャプチャグループに置き換え
	regexPattern := ss.patternToRegex(pattern)

	re, err := regexp.Compile(regexPattern)
	if err != nil {
		slog.Warn("Failed to compile pattern",
			"pattern", pattern,
			"error", err.Error())
		return nil
	}

	matches := re.FindStringSubmatch(fileName)
	if matches == nil || len(matches) < 3 {
		return nil
	}

	// matches[0] は全体、matches[1] は title, matches[2] は episode
	return &SeriesMatch{
		SeriesName: matches[1],
		EpisodeNum: matches[2],
	}
}

// patternToRegex - パターン文字列を正規表現に変換
// 例: "{title}{episode}" -> "^(.+?)(\d+)$"
// 例: "{title}-{episode}" -> "^(.+?)-(\d+)$"
func (ss *SeriesService) patternToRegex(pattern string) string {
	// パターン内の特殊文字をエスケープ
	escaped := regexp.QuoteMeta(pattern)

	// {title} と {episode} を置き換え
	// {title}: 1文字以上の任意の文字（非貪欲）
	// {episode}: 1文字以上の数字
	regex := strings.ReplaceAll(escaped, "\\{title\\}", "(.+?)")
	regex = strings.ReplaceAll(regex, "\\{episode\\}", "(\\d+)")

	// 文字列全体にマッチするように ^ と $ を追加
	regex = "^" + regex + "$"

	return regex
}

// CreateOrGetSeries - シリーズを作成または既存のものを取得
func (ss *SeriesService) CreateOrGetSeries(seriesName string) (*entity.Series, error) {
	var series entity.Series

	// 既存のシリーズを検索
	result := ss.db.Where("series_name_file = ?", seriesName).First(&series)

	if result.Error == gorm.ErrRecordNotFound {
		// 新規シリーズを作成
		series = entity.Series{
			SeriesNameFile: seriesName,
		}

		if err := ss.db.Create(&series).Error; err != nil {
			slog.Error("Failed to create series",
				"series_name", seriesName,
				"error", err.Error())
			return nil, fmt.Errorf("failed to create series: %w", err)
		}

		slog.Info("Created new series",
			"series_name", seriesName,
			"series_id", series.ID)
	} else if result.Error != nil {
		slog.Error("Failed to query series",
			"series_name", seriesName,
			"error", result.Error.Error())
		return nil, fmt.Errorf("failed to query series: %w", result.Error)
	}

	return &series, nil
}

// ExtractAndSyncSeriesForVideo - ビデオからシリーズを抽出して同期
func (ss *SeriesService) ExtractAndSyncSeriesForVideo(video *entity.Video) error {
	fileName := filepath.Base(video.FilePath)

	// ファイル名からシリーズ情報を抽出
	match := ss.ExtractSeriesFromFileName(fileName)
	if match == nil {
		// シリーズが見つからない場合は何もしない
		slog.Debug("No series match found for video",
			"file_name", fileName)
		return nil
	}

	// シリーズを作成または取得
	series, err := ss.CreateOrGetSeries(match.SeriesName)
	if err != nil {
		return err
	}

	// ビデオにシリーズIDを設定
	if video.SeriesID == nil || *video.SeriesID != series.ID {
		video.SeriesID = &series.ID

		if err := ss.db.Model(video).Update("series_id", series.ID).Error; err != nil {
			slog.Error("Failed to update video series_id",
				"video_id", video.ID,
				"series_id", series.ID,
				"error", err.Error())
			return fmt.Errorf("failed to update video series_id: %w", err)
		}

		slog.Debug("Updated video with series",
			"video_id", video.ID,
			"file_name", fileName,
			"series_name", match.SeriesName,
			"series_id", series.ID)
	}

	return nil
}

// SyncAllVideosWithSeries - すべてのビデオをシリーズと同期（手動再同期用）
func (ss *SeriesService) SyncAllVideosWithSeries() error {
	var videos []entity.Video

	// すべての削除されていないビデオを取得
	if err := ss.db.Where("is_deleted = ?", false).Find(&videos).Error; err != nil {
		slog.Error("Failed to fetch videos for series sync",
			"error", err.Error())
		return fmt.Errorf("failed to fetch videos: %w", err)
	}

	successCount := 0
	skipCount := 0
	errorCount := 0

	for _, video := range videos {
		// ビデオコピーを作成
		v := video

		if err := ss.ExtractAndSyncSeriesForVideo(&v); err != nil {
			slog.Error("Failed to sync video with series",
				"video_id", v.ID,
				"file_name", v.FileName,
				"error", err.Error())
			errorCount++
		} else if v.SeriesID != nil {
			successCount++
		} else {
			skipCount++
		}
	}

	slog.Info("Series sync completed",
		"total", len(videos),
		"success", successCount,
		"skipped", skipCount,
		"errors", errorCount)

	return nil
}

// GetSeriesWithVideos - シリーズと関連するビデオを取得
func (ss *SeriesService) GetSeriesWithVideos(seriesID int) (*SeriesWithVideos, error) {
	var series entity.Series
	if err := ss.db.First(&series, seriesID).Error; err != nil {
		return nil, fmt.Errorf("failed to find series: %w", err)
	}

	var videos []entity.Video
	if err := ss.db.Where("series_id = ? AND is_deleted = ?", seriesID, false).
		Order("file_name ASC").
		Find(&videos).Error; err != nil {
		return nil, fmt.Errorf("failed to find videos: %w", err)
	}

	return &SeriesWithVideos{
		Series: &series,
		Videos: videos,
	}, nil
}

// SeriesWithVideos - シリーズとそのビデオ
type SeriesWithVideos struct {
	Series *entity.Series   `json:"series"`
	Videos []entity.Video   `json:"videos"`
}

// GetAllSeries - すべてのシリーズを取得
func (ss *SeriesService) GetAllSeries() ([]entity.Series, error) {
	var series []entity.Series

	if err := ss.db.Order("series_name_file ASC").Find(&series).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch series: %w", err)
	}

	return series, nil
}
