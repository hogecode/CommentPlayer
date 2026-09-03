package service

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/hogecode/commentPlayer/internal/dto"
)

// GetSeriesEpisodeWatchHistory - 特定シリーズのエピソード別視聴履歴を取得
func (s *AdminStatsService) GetSeriesEpisodeWatchHistory(ctx context.Context, seriesID int64) (*dto.SeriesEpisodeWatchHistoryResponse, error) {
	slog.Info("Getting series episode watch history",
		slog.Int64("series_id", seriesID),
	)

	// データベースからシリーズのエピソード別視聴履歴を取得
	rows, err := s.queries.GetSeriesEpisodeWatchHistory(ctx, sql.NullInt64{Int64: seriesID, Valid: true})
	if err != nil {
		slog.Error("Failed to get series episode watch history",
			slog.Int64("series_id", seriesID),
			slog.Any("error", err),
		)
		return nil, err
	}

	// エピソード別にデータを整理
	// ビデオIDをキーにして、そのビデオの全視聴履歴をグループ化
	episodeMap := make(map[int64]*dto.SeriesEpisodeResponse)
	var episodeOrder []int64 // エピソード順序を保つ

	for _, row := range rows {
		// エピソード情報を取得
		var episodeNum *int
		if row.Episode.Valid {
			episodeNum = new(int)
			*episodeNum = int(row.Episode.Int64)
		}

		// ビデオIDがマップに存在しなければ新規作成
		if _, exists := episodeMap[row.ID]; !exists {
			subtitle := ""
			if row.Subtitle.Valid {
				subtitle = row.Subtitle.String
			}
			fileName := ""
			if row.FileName.Valid {
				fileName = row.FileName.String
			}
			views := int64(0)
			if row.Views.Valid {
				views = row.Views.Int64
			}

			episodeMap[row.ID] = &dto.SeriesEpisodeResponse{
				VideoID:      row.ID,
				Episode:      episodeNum,
				Subtitle:     subtitle,
				FileName:     fileName,
				Views:        views,
				WatchHistory: make([]dto.SeriesEpisodeWatchHistoryItem, 0),
			}
			episodeOrder = append(episodeOrder, row.ID)
		}

		// 視聴履歴を追加
		if row.WatchHistoryID.Valid {
			watchedAtStr := ""
			if row.WatchedAt.Valid {
				watchedAtStr = row.WatchedAt.Time.Format(time.RFC3339)
			}
			episodeMap[row.ID].WatchHistory = append(episodeMap[row.ID].WatchHistory, dto.SeriesEpisodeWatchHistoryItem{
				ID:        row.WatchHistoryID.Int64,
				WatchedAt: watchedAtStr,
			})
		}
	}

	// 最終的なレスポンスを構築
	episodes := make([]dto.SeriesEpisodeResponse, 0)
	for _, videoID := range episodeOrder {
		episodes = append(episodes, *episodeMap[videoID])
	}

	response := &dto.SeriesEpisodeWatchHistoryResponse{
		SeriesID: seriesID,
		Episodes: episodes,
	}

	slog.Info("Series episode watch history retrieved",
		slog.Int64("series_id", seriesID),
		slog.Int("episode_count", len(episodes)),
	)

	return response, nil
}
