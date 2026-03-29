package service

import (
	"fmt"
	"log/slog"
	"strconv"

	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/syobocal/api"
	"gorm.io/gorm"
)

// SyobocalService - Syobocal タイトル検索サービス
type SyobocalService struct {
	db     *gorm.DB
	client *api.Client
}

// NewSyobocalService - SyobocalService を新規作成
func NewSyobocalService(db *gorm.DB) *SyobocalService {
	return &SyobocalService{
		db:     db,
		client: api.NewClient(),
	}
}

// SearchTitles - タイトルを検索して複数候補を返す
func (ss *SyobocalService) SearchTitles(titleQuery string) (*dto.SyobocalTitleSearchResponse, error) {
	slog.Info("Syobocal title search started",
		slog.String("query", titleQuery))

	// API から検索実行
	resp, err := ss.client.TitleSearch(titleQuery)
	if err != nil {
		slog.Error("Syobocal API search failed",
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to search titles: %w", err)
	}

	if resp == nil || resp.Titles == nil {
		return &dto.SyobocalTitleSearchResponse{
			Total:  0,
			Titles: []dto.SyobocalTitleResponse{},
		}, nil
	}

	// レスポンス変換
	titles := make([]dto.SyobocalTitleResponse, 0)
	for _, title := range resp.Titles {
		// FirstYear と FirstMonth を int に変換
		firstYear, _ := strconv.Atoi(title.FirstYear)
		firstMonth, _ := strconv.Atoi(title.FirstMonth)
		
		// FirstEndYear と FirstEndMonth を int に変換（nullableなため）
		var firstEndYear, firstEndMonth *int
		if title.FirstEndYear != nil && *title.FirstEndYear != "" {
			if y, err := strconv.Atoi(*title.FirstEndYear); err == nil {
				firstEndYear = &y
			}
		}
		if title.FirstEndMonth != nil && *title.FirstEndMonth != "" {
			if m, err := strconv.Atoi(*title.FirstEndMonth); err == nil {
				firstEndMonth = &m
			}
		}

		titles = append(titles, dto.SyobocalTitleResponse{
			TID:           title.TID,
			Title:         title.Title,
			ShortTitle:    title.ShortTitle,
			TitleEN:       title.TitleEN,
			Comment:       title.Comment,
			FirstYear:     strconv.Itoa(firstYear),
			FirstMonth:    strconv.Itoa(firstMonth),
			FirstEndYear:  firstEndYear,
			FirstEndMonth: firstEndMonth,
		})
	}

	slog.Info("Syobocal title search completed",
		slog.Int("result_count", len(titles)))

	return &dto.SyobocalTitleSearchResponse{
		Total:  len(titles),
		Titles: titles,
	}, nil
}

// SaveTitleToSeries - 選択したタイトル情報を Series に保存
func (ss *SyobocalService) SaveTitleToSeries(req *dto.SyobocalSaveTitleRequest) (*dto.SyobocalSaveTitleResponse, error) {
	slog.Info("Saving Syobocal title to Series",
		slog.Int("syobocal_title_id", req.SyobocalTitleID),
		slog.String("syobocal_title_name", req.SyobocalTitleName))

	// Series を作成または更新
	series := entity.Series{
		SeriesNameFile:      req.SyobocalTitleName,
		SyobocalTitleID:     &req.SyobocalTitleID,
		SyobocalTitleName:   &req.SyobocalTitleName,
		SyobocalTitleNameEn: req.TitleNameEN,
		Comment:             req.Comment,
	}

	// FirstYear と FirstMonth を int* に変換
	if req.FirstYear != nil {
		series.FirstYear = req.FirstYear
	}
	if req.FirstMonth != nil {
		series.FirstMonth = req.FirstMonth
	}

	// 既存チェック - SyobocalTitleID で検索
	var existingSeries entity.Series
	result := ss.db.Where("syobocal_title_id = ?", req.SyobocalTitleID).First(&existingSeries)

	if result.Error == nil {
		// 既存レコード更新
		if err := ss.db.Model(&existingSeries).Updates(&series).Error; err != nil {
			slog.Error("Failed to update Series",
				slog.Int("syobocal_title_id", req.SyobocalTitleID),
				slog.String("error", err.Error()))
			return nil, fmt.Errorf("failed to update series: %w", err)
		}

		slog.Info("Series updated successfully",
			slog.Int("series_id", existingSeries.ID),
			slog.Int("syobocal_title_id", req.SyobocalTitleID))

		return &dto.SyobocalSaveTitleResponse{
			Success:  true,
			Message:  "Series updated successfully",
			SeriesID: existingSeries.ID,
		}, nil
	} else if result.Error == gorm.ErrRecordNotFound {
		// 新規作成
		if err := ss.db.Create(&series).Error; err != nil {
			slog.Error("Failed to create Series",
				slog.String("series_name", req.SyobocalTitleName),
				slog.String("error", err.Error()))
			return nil, fmt.Errorf("failed to create series: %w", err)
		}

		slog.Info("Series created successfully",
			slog.Int("series_id", series.ID),
			slog.Int("syobocal_title_id", req.SyobocalTitleID))

		return &dto.SyobocalSaveTitleResponse{
			Success:  true,
			Message:  "Series created successfully",
			SeriesID: series.ID,
		}, nil
	}

	// 予期しないエラー
	slog.Error("Unexpected error when querying Series",
		slog.String("error", result.Error.Error()))
	return nil, fmt.Errorf("unexpected error: %w", result.Error)
}
