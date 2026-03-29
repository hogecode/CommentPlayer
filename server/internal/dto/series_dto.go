package dto

import "github.com/hogecode/commentPlayer/internal/entity"

// SeriesResponse - シリーズレスポンス
type SeriesResponse struct {
	ID                int    `json:"id"`
	SeriesNameFile    string `json:"series_name_file"`
	SyobocalTitleID   *int   `json:"syobocal_title_id,omitempty"`
	SyobocalTitleName *string `json:"syobocal_title_name,omitempty"`
	SyobocalTitleNameEn *string `json:"syobocal_title_name_en,omitempty"`
	Comment           *string `json:"comment,omitempty"`
	FirstYear         *int   `json:"first_year,omitempty"`
	FirstMonth        *int   `json:"first_month,omitempty"`
	FirstEndYear      *int   `json:"first_end_year,omitempty"`
	FirstEndMonth     *int   `json:"first_end_month,omitempty"`
	Subtitles         *string `json:"subtitles,omitempty"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

// SeriesWithVideosResponse - シリーズとビデオを含むレスポンス
type SeriesWithVideosResponse struct {
	Series *SeriesResponse `json:"series"`
	Videos []VideoResponse `json:"videos"`
}

// SeriesListResponse - シリーズリストレスポンス
type SeriesListResponse struct {
	Total   int              `json:"total"`
	Series  []SeriesResponse `json:"series"`
}

// ToSeriesResponse - エンティティをレスポンスに変換
func ToSeriesResponse(s *entity.Series) *SeriesResponse {
	return &SeriesResponse{
		ID:                  s.ID,
		SeriesNameFile:      s.SeriesNameFile,
		SyobocalTitleID:     s.SyobocalTitleID,
		SyobocalTitleName:   s.SyobocalTitleName,
		SyobocalTitleNameEn: s.SyobocalTitleNameEn,
		Comment:             s.Comment,
		FirstYear:           s.FirstYear,
		FirstMonth:          s.FirstMonth,
		FirstEndYear:        s.FirstEndYear,
		FirstEndMonth:       s.FirstEndMonth,
		Subtitles:           s.Subtitles,
		CreatedAt:           s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:           s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// ToSeriesResponseSlice - エンティティスライスをレスポンススライスに変換
func ToSeriesResponseSlice(series []entity.Series) []SeriesResponse {
	responses := make([]SeriesResponse, len(series))
	for i, s := range series {
		responses[i] = *ToSeriesResponse(&s)
	}
	return responses
}
