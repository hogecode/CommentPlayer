package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
)

// ============ Router Registration ============

// RegisterCaptureRoutes - キャプチャ関連ルートを登録
func (a *App) RegisterCaptureRoutes(capturesGroup *gin.RouterGroup) {
	a.GetCaptures(capturesGroup)
	a.CreateCapture(capturesGroup)
}

// GetCaptures - キャプチャ一覧を取得
// @Summary キャプチャ一覧を取得
// @Description キャプチャ一覧をページネーション付きで取得します
// @Tags Captures
// @Param video_id query int false "ビデオID（フィルタリング用）"
// @Param page query int false "ページ番号" default(1)
// @Param limit query int false "1ページあたりのアイテム数" default(20)
// @Produce json
// @Success 200 {object} dto.CaptureListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/captures [get]
func (a *App) GetCaptures(capturesGroup *gin.RouterGroup) {
	capturesGroup.GET("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.CaptureListRequest
		if err := ctx.ShouldBindQuery(&req); err != nil {
			ctx.JSON(http.StatusUnprocessableEntity, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// デフォルト値を設定
		req.SetDefaults()

		// バリデーション
		if err := a.Validator.Struct(req); err != nil {
			ctx.JSON(http.StatusUnprocessableEntity, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		captures, total, err := a.CaptureQuery.GetCaptureList(req.VideoID, req.Page, req.Limit)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		totalPages := (int(total) + req.Limit - 1) / req.Limit
		ctx.JSON(http.StatusOK, dto.CaptureListResponse{
			Data: captures,
			Pagination: dto.Pagination{
				Page:       req.Page,
				Limit:      req.Limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})
}

// CreateCapture - キャプチャを作成
// @Summary キャプチャを作成
// @Description 新しいキャプチャを作成します
// @Tags Captures
// @Param file formData file true "キャプチャファイル"
// @Param video_id formData int true "ビデオID"
// @Consume multipart/form-data
// @Produce json
// @Success 201 {object} entity.Capture
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/captures [post]
func (a *App) CreateCapture(capturesGroup *gin.RouterGroup) {
	capturesGroup.POST("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// MultipartForm から video_id を取得
		videoIDStr := ctx.PostForm("video_id")
		if videoIDStr == "" {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_id_required"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		videoID, err := strconv.Atoi(videoIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// ビデオの存在確認
		_, err = a.VideoQuery.GetVideoByID(videoID)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// ファイルアップロード処理
		file, err := ctx.FormFile("file")
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "file_required"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// Capture エンティティを作成
		capture := entity.Capture{
			Filename:  file.Filename,
			VideoID:   videoID,
			CreatedAt: time.Now(),
		}

		// DB処理をqueryパッケージに委譲
		if err := a.CaptureQuery.CreateCapture(&capture); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_create_capture"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// キャプチャファイルの保存処理
		// config.yamlで指定した保存先ディレクトリに保存する
		if a.Config == nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_capture_file"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		capturesDir := a.Config.Storage.CapturesDir

		// ディレクトリが存在しない場合は作成
		if err := os.MkdirAll(capturesDir, 0755); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_capture_file"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// ファイルを保存：キャプチャIDとファイル名から保存先パスを構築
		savePath := filepath.Join(capturesDir, fmt.Sprintf("%d_%s", capture.ID, file.Filename))
		if err := ctx.SaveUploadedFile(file, savePath); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_capture_file"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		ctx.JSON(http.StatusCreated, capture)
	})
}
