package handler

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/service"
)

// RegisterSyobocalRoutes - Syobocal ルートを登録
func RegisterSyobocalRoutes(syobocalGroup *gin.RouterGroup, syobocalService *service.SyobocalService) {
	syobocalGroup.GET("", SearchTitles(syobocalService))
	syobocalGroup.POST("", SaveTitle(syobocalService))
}

// SearchTitles - Syobocal タイトル検索
// @Summary Syobocal からタイトル候補を検索
// @Description 指定されたタイトルを Syobocal から検索し、複数候補を返す
// @Tags Syobocal
// @Param title query string true "検索するタイトル"
// @Produce json
// @Success 200 {object} dto.SyobocalTitleSearchResponse
// @Failure 400 {object} dto.SyobocalErrorResponse
// @Failure 500 {object} dto.SyobocalErrorResponse
// @Router /api/v1/syobocal [get]
func SearchTitles(service *service.SyobocalService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// クエリパラメータからタイトル取得
		title := c.Query("title")
		if title == "" {
			slog.Warn("Title parameter is empty")
			c.JSON(http.StatusBadRequest, dto.SyobocalErrorResponse{
				Error:   "bad_request",
				Message: "title parameter is required",
			})
			return
		}

		// タイトル検索実行
		response, err := service.SearchTitles(title)
		if err != nil {
			slog.Error("Search failed",
				slog.String("title", title),
				slog.String("error", err.Error()))
			c.JSON(http.StatusInternalServerError, dto.SyobocalErrorResponse{
				Error:   "internal_error",
				Message: "Failed to search titles",
			})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}

// SaveTitle - Syobocal タイトルを Series に保存
// @Summary Syobocal タイトル情報を Series に保存
// @Description 選択したタイトル情報を Series テーブルに保存または更新
// @Tags Syobocal
// @Accept json
// @Produce json
// @Param request body dto.SyobocalSaveTitleRequest true "保存するタイトル情報"
// @Success 200 {object} dto.SyobocalSaveTitleResponse
// @Failure 400 {object} dto.SyobocalErrorResponse
// @Failure 500 {object} dto.SyobocalErrorResponse
// @Router /api/v1/syobocal [post]
func SaveTitle(syobocalService *service.SyobocalService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// リクエストボディをパース
		var req dto.SyobocalSaveTitleRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			slog.Warn("Invalid request body",
				slog.String("error", err.Error()))
			c.JSON(http.StatusBadRequest, dto.SyobocalErrorResponse{
				Error:   "bad_request",
				Message: "Invalid request body",
			})
			return
		}

		// Series に保存
		response, err := syobocalService.SaveTitleToSeries(&req)
		if err != nil {
			slog.Error("Failed to save title",
				slog.Int("syobocal_title_id", req.SyobocalTitleID),
				slog.String("error", err.Error()))
			c.JSON(http.StatusInternalServerError, dto.SyobocalErrorResponse{
				Error:   "internal_error",
				Message: "Failed to save title",
			})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}

// RegisterSyobocalRoutesHandler - App から呼び出し用のラッパー（App.go に定義された構造を使用）
func (a *App) RegisterSyobocalRoutesHandler(syobocalGroup *gin.RouterGroup) {
	syobocalService := service.NewSyobocalService(a.DB)
	RegisterSyobocalRoutes(syobocalGroup, syobocalService)
}
