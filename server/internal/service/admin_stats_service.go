package service

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/hogecode/commentPlayer/internal/db"
	"github.com/hogecode/commentPlayer/internal/dto"
)

// AdminStatsService - 管理画面用統計サービス
type AdminStatsService struct {
	queries *db.Queries
}

// NewAdminStatsService - 統計サービスの初期化
func NewAdminStatsService(queries *db.Queries) *AdminStatsService {
	return &AdminStatsService{
		queries: queries,
	}
}

// GetMonthlyStats - 指定年月の統計情報を取得
func (s *AdminStatsService) GetMonthlyStats(ctx context.Context, year int, month int) (*dto.AdminStatsResponse, error) {
	// 月の範囲を計算
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Nanosecond)

	slog.Info("GetMonthlyStats processing",
		slog.Int("year", year),
		slog.Int("month", month),
		slog.String("startDate", startDate.Format(time.RFC3339)),
		slog.String("endDate", endDate.Format(time.RFC3339)),
	)

	// 日付ごとの再生数を取得
	dailyViews, err := s.queries.GetDailyViews(ctx, db.GetDailyViewsParams{
		WatchedAt:   sql.NullTime{Time: startDate, Valid: true},
		WatchedAt_2: sql.NullTime{Time: endDate, Valid: true},
	})
	if err != nil {
		slog.Error("Failed to get daily views", slog.Any("error", err))
		return nil, err
	}
	slog.Info("Daily views fetched", slog.Int("count", len(dailyViews)))

	// シリーズごとの再生数を取得
	seriesViews, err := s.queries.GetSeriesViews(ctx)
	if err != nil {
		slog.Error("Failed to get series views", slog.Any("error", err))
		return nil, err
	}

	// 動画ランキングを取得（上位20件）
	videoRanking, err := s.queries.GetVideoRanking(ctx, 20)
	if err != nil {
		slog.Error("Failed to get video ranking", slog.Any("error", err))
		return nil, err
	}

	// 日付ごとの視聴履歴を取得
	watchedHistory, err := s.queries.GetWatchedHistoryByDate(ctx, db.GetWatchedHistoryByDateParams{
		WatchedAt:   sql.NullTime{Time: startDate, Valid: true},
		WatchedAt_2: sql.NullTime{Time: endDate, Valid: true},
	})
	if err != nil {
		slog.Error("Failed to get watched history by date", slog.Any("error", err))
		return nil, err
	}

	// 月別統計を取得
	monthlySummary, err := s.queries.GetMonthlyStats(ctx, db.GetMonthlyStatsParams{
		WatchedAt:   sql.NullTime{Time: startDate, Valid: true},
		WatchedAt_2: sql.NullTime{Time: endDate, Valid: true},
	})
	if err != nil {
		slog.Error("Failed to get monthly stats", slog.Any("error", err))
		return nil, err
	}

	// DTO に変換
	response := &dto.AdminStatsResponse{
		Year:  year,
		Month: month,
		MonthlySummary: &dto.MonthlyStatsResponse{
			DaysWithViews:       monthlySummary.DaysWithViews,
			TotalViewsMonth:     monthlySummary.TotalViewsThisMonth,
			UniqueVideosWatched: monthlySummary.UniqueVideosWatched,
		},
	}

	// 日付ごとの再生数を変換
	response.DailyViews = make([]dto.DailyViewsResponse, 0)
	for _, dv := range dailyViews {
		dateStr := ""
		// dv.DateはNULL可能なため、interface{}で返される
		if dv.Date != nil {
			if date, ok := dv.Date.(string); ok {
				dateStr = date
			}
		}
		response.DailyViews = append(response.DailyViews, dto.DailyViewsResponse{
			Date:      dateStr,
			ViewCount: dv.ViewCount,
		})
	}

	// シリーズごとの再生数を変換
	response.SeriesViews = make([]dto.SeriesViewsResponse, 0)
	for _, sv := range seriesViews {
		totalViews := int64(0)
		if sv.TotalViews.Valid {
			totalViews = int64(sv.TotalViews.Float64)
		}
		response.SeriesViews = append(response.SeriesViews, dto.SeriesViewsResponse{
			SeriesID:   int(sv.SeriesID),
			SeriesName: sv.SeriesName,
			TotalViews: totalViews,
			VideoCount: sv.VideoCount,
		})
	}

	// 動画ランキングを変換
	response.VideoRanking = make([]dto.VideoRankingResponse, 0)
	for _, vr := range videoRanking {
		fileName := ""
		if vr.FileName.Valid {
			fileName = vr.FileName.String
		}
		views := int64(0)
		if vr.Views.Valid {
			views = vr.Views.Int64
		}
		updatedAt := time.Time{}
		if vr.UpdatedAt.Valid {
			updatedAt = vr.UpdatedAt.Time
		}
		var seriesName *string
		if vr.SeriesName.Valid {
			seriesName = &vr.SeriesName.String
		}
		response.VideoRanking = append(response.VideoRanking, dto.VideoRankingResponse{
			VideoID:    int(vr.ID),
			FileName:   fileName,
			Views:      int(views),
			UpdatedAt:  updatedAt,
			SeriesName: seriesName,
		})
	}

	// 日付ごとの視聴履歴を変換
	response.WatchedHistoryByDate = make([]dto.WatchedHistoryByDateResponse, 0)
	for _, wh := range watchedHistory {
		dateStr := ""
		// wh.DateはNULL可能なため、interface{}で返される
		if wh.Date != nil {
			if date, ok := wh.Date.(string); ok {
				dateStr = date
			}
		}
		response.WatchedHistoryByDate = append(response.WatchedHistoryByDate, dto.WatchedHistoryByDateResponse{
			Date:       dateStr,
			WatchCount: wh.WatchCount,
		})
	}

	slog.Info("Monthly stats retrieved",
		slog.Int("year", year),
		slog.Int("month", month),
		slog.Int("daily_views_count", len(response.DailyViews)),
	)

	return response, nil
}
