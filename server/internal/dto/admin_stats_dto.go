package dto

import "time"

// DailyVideoViewResponse - 日付ごとの動画視聴詳細
type DailyVideoViewResponse struct {
	VideoID    int    `json:"video_id"`
	FileName   string `json:"file_name"`
	Subtitle   string `json:"subtitle"` // 動画のサブタイトル
	SeriesName string `json:"series_name"`
	ViewCount  int64  `json:"view_count"` // その動画のその日の再生数
}

// DailyViewsResponse - 日付ごとの再生数（詳細データ付き）
type DailyViewsResponse struct {
	Date      string                   `json:"date"`       // YYYY-MM-DD format
	ViewCount int64                    `json:"view_count"` // その日の総再生数
	Videos    []DailyVideoViewResponse `json:"videos"`     // その日に視聴された動画の詳細
}

// SeriesViewsResponse - シリーズごとの再生数
type SeriesViewsResponse struct {
	SeriesID   int    `json:"series_id"`
	SeriesName string `json:"series_name"`
	TotalViews int64  `json:"total_views"`
	VideoCount int64  `json:"video_count"` // シリーズ内の動画数
}

// VideoRankingResponse - 動画ランキング
type VideoRankingResponse struct {
	VideoID    int       `json:"video_id"`
	FileName   string    `json:"file_name"`
	Views      int       `json:"views"`
	UpdatedAt  time.Time `json:"updated_at"`
	SeriesName *string   `json:"series_name"`
}

// WatchedHistoryByDateResponse - 日付ごとの視聴履歴件数
type WatchedHistoryByDateResponse struct {
	Date       string `json:"date"`        // YYYY-MM-DD format
	WatchCount int64  `json:"watch_count"` // その日の視聴数
}

// MonthlyStatsResponse - 月別統計サマリー
type MonthlyStatsResponse struct {
	DaysWithViews       int64 `json:"days_with_views"`       // 再生があった日数
	TotalViewsMonth     int64 `json:"total_views_month"`     // 月間再生数
	UniqueVideosWatched int64 `json:"unique_videos_watched"` // ユニーク動画数
}

// AdminStatsResponse - 統計全体のレスポンス
type AdminStatsResponse struct {
	Year                 int                            `json:"year"`
	Month                int                            `json:"month"`
	MonthlySummary       *MonthlyStatsResponse          `json:"monthly_summary"`
	DailyViews           []DailyViewsResponse           `json:"daily_views"`
	SeriesViews          []SeriesViewsResponse          `json:"series_views"`
	VideoRanking         []VideoRankingResponse         `json:"video_ranking"`
	WatchedHistoryByDate []WatchedHistoryByDateResponse `json:"watched_history_by_date"`
}
