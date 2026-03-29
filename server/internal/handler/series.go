package handler

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/query"
	"github.com/hogecode/commentPlayer/internal/service"
)

// SeriesHandler - シリーズハンドラー
type SeriesHandler struct {
	db            *gorm.DB
	seriesService *service.SeriesService
	seriesQuery   *query.SeriesQuery
}

// NewSeriesHandler - SeriesHandlerを新規作成
func NewSeriesHandler(db *gorm.DB, cfg *config.Config) *SeriesHandler {
	return &SeriesHandler{
		db:            db,
		seriesService: service.NewSeriesService(db, cfg),
		seriesQuery:   query.NewSeriesQuery(db),
	}
}

// GetSeries - シリーズ一覧を取得
// @Summary シリーズ一覧を取得
// @Description 全てのシリーズの一覧を取得します
// @Tags Series
// @Produce json
// @Success 200 {object} dto.SeriesListResponse
// @Failure 500 {object} gin.H
// @Router /api/v1/series [get]
func (sh *SeriesHandler) GetSeries(c *gin.Context) {
	series, err := sh.seriesQuery.GetAll()
	if err != nil {
		slog.Error("Failed to get series",
			"error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get series",
		})
		return
	}

	response := dto.SeriesListResponse{
		Total:  len(series),
		Series: dto.ToSeriesResponseSlice(series),
	}

	c.JSON(http.StatusOK, response)
}

// GetSeriesWithVideos - シリーズとそのビデオを取得
// @Summary シリーズとそのビデオを取得
// @Description 指定されたシリーズIDに関連する全てのビデオを取得します
// @Tags Series
// @Param id path int true "シリーズID"
// @Produce json
// @Success 200 {object} dto.SeriesWithVideosResponse
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /api/v1/series/{id} [get]
func (sh *SeriesHandler) GetSeriesWithVideos(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid series ID",
		})
		return
	}

	seriesWithVideos, err := sh.seriesService.GetSeriesWithVideos(id)
	if err != nil {
		slog.Error("Failed to get series with videos",
			"series_id", id,
			"error", err.Error())
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Series not found",
		})
		return
	}

	response := dto.SeriesWithVideosResponse{
		Series: dto.ToSeriesResponse(seriesWithVideos.Series),
		Videos: make([]dto.VideoResponse, len(seriesWithVideos.Videos)),
	}

	for i, v := range seriesWithVideos.Videos {
		response.Videos[i] = dto.VideoResponse{
			Video:    &v,
			Src:      "",
			Comments: []dto.ApiComment{},
		}
	}

	c.JSON(http.StatusOK, response)
}

// ResyncSeries - すべてのビデオをシリーズと同期（手動再同期）
// @Summary すべてのビデオをシリーズと同期
// @Description 全てのビデオをシリーズと再同期します。ファイル名パターンからシリーズを抽出し、ビデオに割り当てます。
// @Tags Series
// @Produce json
// @Success 200 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /api/v1/series/resync [post]
func (sh *SeriesHandler) ResyncSeries(c *gin.Context) {
	if err := sh.seriesService.SyncAllVideosWithSeries(); err != nil {
		slog.Error("Failed to resync series",
			"error", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to resync series",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Series resync completed successfully",
	})
}

// RegisterSeriesRoutes - シリーズルートを登録
func RegisterSeriesRoutes(seriesGroup *gin.RouterGroup, sh *SeriesHandler) {
	seriesGroup.GET("", sh.GetSeries)
	seriesGroup.GET("/:id", sh.GetSeriesWithVideos)
	seriesGroup.POST("/resync", sh.ResyncSeries)
}
