package service

import (
	"fmt"
	"log/slog"
	"strconv"
	"time"

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

// SaveTitleToSeries - Syobocal タイトル情報を Series に保存（UPDATE のみ）
// フロント → バックエンドAPI → Syobocal API(TitleLookup) → バックエンド → フロント
// TODO: トランザクションで実行したい
func (ss *SyobocalService) SaveTitleToSeries(req *dto.SyobocalSaveTitleRequest) (*dto.SyobocalSaveTitleResponse, error) {
	slog.Info("Saving Syobocal title to Series",
		slog.String("tid", req.TID),
		slog.String("title", req.Title),
		slog.Int("series_id", req.SeriesID))

	// TitleLookup API を呼び出して詳細情報を取得
	titleLookup, err := ss.client.TitleLookup(req.TID)
	if err != nil {
		slog.Error("Failed to call TitleLookup API",
			slog.String("tid", req.TID),
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to call TitleLookup API: %w", err)
	}

	if titleLookup == nil || len(titleLookup.TitleItems) == 0 {
		slog.Error("No title items found in TitleLookup response",
			slog.String("tid", req.TID))
		return nil, fmt.Errorf("no title items found in TitleLookup response")
	}

	item := titleLookup.TitleItems[0]

	// Comment と Subtitles をパース
	commentJSON := make(entity.JSONMap)
	subtitlesJSON := make(entity.JSONArray, 0)

	if item.Comment != "" {
		commentJSON = entity.JSONMap(ParseCommentStructure(item.Comment))
	}
	if item.SubTitles != "" {
		subtitlesJSON = entity.JSONArray(ParseSubtitles(item.SubTitles))
	}

	// TID を int に変換
	tid, err := strconv.Atoi(req.TID)
	if err != nil {
		slog.Error("Failed to convert TID to int",
			slog.String("tid", req.TID),
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to convert TID to int: %w", err)
	}

	// Series を更新
	updates := map[string]interface{}{
		"syobocal_title_id":      tid,
		"syobocal_title_name":    item.Title,
		"syobocal_title_name_en": item.TitleEN,
		"comment":                commentJSON,
		"subtitles":              subtitlesJSON,
	}

	// FirstYear, FirstMonth, FirstEndYear, FirstEndMonth を追加
	if item.FirstYear != "" {
		if y, err := strconv.Atoi(item.FirstYear); err == nil {
			updates["first_year"] = y
		}
	}
	if item.FirstMonth != "" {
		if m, err := strconv.Atoi(item.FirstMonth); err == nil {
			updates["first_month"] = m
		}
	}
	if item.FirstEndYear != "" {
		if y, err := strconv.Atoi(item.FirstEndYear); err == nil {
			updates["first_end_year"] = y
		}
	}
	if item.FirstEndMonth != "" {
		if m, err := strconv.Atoi(item.FirstEndMonth); err == nil {
			updates["first_end_month"] = m
		}
	}

	// 既存シリーズを UPDATE
	if err := ss.db.Model(&entity.Series{}).Where("id = ?", req.SeriesID).Updates(updates).Error; err != nil {
		slog.Error("Failed to update Series",
			slog.Int("series_id", req.SeriesID),
			slog.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update series: %w", err)
	}

	slog.Info("Series updated successfully",
		slog.Int("series_id", req.SeriesID),
		slog.Int("syobocal_title_id", tid))

	// ProgLookup API を呼び出して Video テーブルを更新
	// エラーは記録するが、Series 更新は成功しているため、エラーを返さない
	if err := ss.UpdateVideosFromProgLookup(req.SeriesID, req.TID); err != nil {
		slog.Error("Failed to update videos from ProgLookup",
			slog.Int("series_id", req.SeriesID),
			slog.String("tid", req.TID),
			slog.String("error", err.Error()))
		// Series の更新は成功しているため、エラーを返さずに継続
	}

	return &dto.SyobocalSaveTitleResponse{
		Success:  true,
		Message:  "Series updated successfully",
		SeriesID: req.SeriesID,
	}, nil
}

// UpdateVideosFromProgLookup - ProgLookup API を呼び出して Video テーブルを更新
func (ss *SyobocalService) UpdateVideosFromProgLookup(seriesID int, tid string) error {
	slog.Info("Updating videos from ProgLookup API",
		slog.Int("series_id", seriesID),
		slog.String("tid", tid))

	// ProgLookup API を呼び出す
	// サブタイトル取得API
	chIDsParam := "1,2,3,4,5,6,7,8,9,19" 
	// Using 1-9 and 19 (TOKYO MX) as they are the main channels with good Jikkyo support
	progLookup, err := ss.client.ProgLookup(tid, chIDsParam)
	if err != nil {
		slog.Error("Failed to call ProgLookup API",
			slog.String("tid", tid),
			slog.String("error", err.Error()))
		return fmt.Errorf("failed to call ProgLookup API: %w", err)
	}

	if progLookup == nil || len(progLookup.ProgItems) == 0 {
		slog.Warn("No ProgItems found in ProgLookup response",
			slog.String("tid", tid))
		return nil
	}

	// ProgItem をループして Video を更新
	updatedCount := 0
	for _, progItem := range progLookup.ProgItems {

		// Count（エピソード番号）がない場合はスキップ
		if progItem.Count == "" {
			slog.Debug("Skipping ProgItem without Count",
				slog.String("pid", progItem.PID))
			continue
		}

		// Count を int に変換
		episode, err := strconv.Atoi(progItem.Count)
		if err != nil {
			slog.Warn("Failed to convert Count to int",
				slog.String("pid", progItem.PID),
				slog.String("count", progItem.Count),
				slog.String("error", err.Error()))
			continue
		}

		// StTime と EdTime をパース
		const timeLayout = "2006-01-02 15:04:05"
		progStartTime, err := time.Parse(timeLayout, progItem.StTime)
		if err != nil {
			slog.Warn("Failed to parse StTime",
				slog.String("pid", progItem.PID),
				slog.String("st_time", progItem.StTime),
				slog.String("error", err.Error()))
			progStartTime = time.Time{} // Default value
		}

		progEndTime, err := time.Parse(timeLayout, progItem.EdTime)
		if err != nil {
			slog.Warn("Failed to parse EdTime",
				slog.String("pid", progItem.PID),
				slog.String("ed_time", progItem.EdTime),
				slog.String("error", err.Error()))
			progEndTime = time.Time{} // Default value
		}

		// ChID を int に変換
		chIDInt, err := strconv.Atoi(progItem.ChID)
		if err != nil {
			slog.Warn("Failed to convert ChID to int",
				slog.String("pid", progItem.PID),
				slog.String("ch_id", progItem.ChID),
				slog.String("error", err.Error()))
			continue
		}

		// Video を更新
		updates := map[string]interface{}{
			"subtitle":     progItem.STSubTitle,
			"channel_id":      chIDInt,
			"prog_start_time": progStartTime,
			"prog_end_time":   progEndTime,
		}

		if err := ss.db.Model(&entity.Video{}).
			Where("series_id = ? AND episode = ?", seriesID, episode).
			Updates(updates).Error; err != nil {
			slog.Error("Failed to update Video",
				slog.Int("series_id", seriesID),
				slog.Int("episode", episode),
				slog.String("error", err.Error()))
			continue
		}

		updatedCount++
		slog.Debug("Video updated successfully",
			slog.Int("series_id", seriesID),
			slog.Int("episode", episode),
			slog.String("st_subtitle", progItem.STSubTitle))
	}

	slog.Info("ProgLookup video update completed",
		slog.Int("series_id", seriesID),
		slog.Int("updated_count", updatedCount))

	return nil
}
