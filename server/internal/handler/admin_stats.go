package handler

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/service"
	"github.com/gin-gonic/gin"
)

// AdminStatsHandler - 管理画面統計ハンドラー
type AdminStatsHandler struct {
	statsService *service.AdminStatsService
}

// NewAdminStatsHandler - ハンドラーの初期化
func NewAdminStatsHandler(statsService *service.AdminStatsService) *AdminStatsHandler {
	return &AdminStatsHandler{
		statsService: statsService,
	}
}

// GetMonthlyStats - 月別統計を取得
// @Summary 月別統計を取得
// @Description 指定年月の統計情報（日付ごと再生数、シリーズ別再生数、動画ランキング等）を取得
// @Tags Admin
// @Param year query integer false "年（デフォルト: 当年）"
// @Param month query integer false "月（デフォルト: 当月, 1-12）"
// @Success 200 {object} dto.AdminStatsResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/admin/stats/monthly [get]
func (h *AdminStatsHandler) GetMonthlyStats(c *gin.Context) {
	// 年月パラメータの取得（デフォルトは現在の年月）
	now := time.Now()
	year := now.Year()
	month := int(now.Month())

	// クエリパラメータから取得（あれば上書き）
	if yearParam := c.Query("year"); yearParam != "" {
		if y, err := strconv.Atoi(yearParam); err == nil {
			year = y
		}
	}

	if monthParam := c.Query("month"); monthParam != "" {
		if m, err := strconv.Atoi(monthParam); err == nil && m >= 1 && m <= 12 {
			month = m
		}
	}

	slog.Info("GetMonthlyStats requested",
		slog.Int("year", year),
		slog.Int("month", month),
	)

	// 統計情報を取得
	stats, err := h.statsService.GetMonthlyStats(c.Request.Context(), year, month)
	if err != nil {
		slog.Error("Failed to get monthly stats",
			slog.Int("year", year),
			slog.Int("month", month),
			slog.Any("error", err),
		)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to retrieve monthly statistics",
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}
