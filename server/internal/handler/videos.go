package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	
	"github.com/hogecode/CommentVideo/internal/dto"
	"github.com/hogecode/CommentVideo/internal/i18n"
)

// RegisterVideoRoutes - ビデオ関連ルートを登録
// @title CommentVideo API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host localhost:8000
// @basePath /
func (a *App) RegisterVideoRoutes(videosGroup *gin.RouterGroup) {
	
	// GET /api/v1/videos
	// @Summary ビデオ一覧を取得
	// @Description ページネーション対応のビデオ一覧を取得します
	// @Tags Videos
	// @Param ids query []int false "ビデオID（複数指定可能）"
	// @Param filterBy query string false "フィルター"
	// @Param page query int false "ページ番号" default(1)
	// @Param limit query int false "1ページあたりのアイテム数" default(20)
	// @Param sort query string false "ソート対象フィールド" default(created_at)
	// @Param order query string false "ソート順序" default(desc)
	// @Produce json
	// @Success 200 {object} dto.VideoListResponse
	// @Failure 422 {object} dto.ErrorResponse
	// @Failure 500 {object} dto.ErrorResponse
	// @Router /api/v1/videos [get]
	videosGroup.GET("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.VideoListRequest
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
		videos, total, err := a.VideoQuery.GetVideoList(req.IDs, req.FilterBy, req.Page, req.Limit, req.Sort, req.Order)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_videos"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		totalPages := (int(total) + req.Limit - 1) / req.Limit
		ctx.JSON(http.StatusOK, dto.VideoListResponse{
			Data: videos,
			Pagination: dto.Pagination{
				Page:       req.Page,
				Limit:      req.Limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})

	// GET /api/v1/videos/search
	// @Summary ビデオを検索
	// @Description キーワードでビデオを検索します
	// @Tags Videos
	// @Param q query string true "検索キーワード"
	// @Param page query int false "ページ番号" default(1)
	// @Param limit query int false "1ページあたりのアイテム数" default(20)
	// @Param order query string false "ソート順序" default(desc)
	// @Param filterBy query string false "フィルター"
	// @Produce json
	// @Success 200 {object} dto.VideoListResponse
	// @Failure 400 {object} dto.ErrorResponse
	// @Failure 500 {object} dto.ErrorResponse
	// @Router /api/v1/videos/search [get]
	videosGroup.GET("/search", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.VideoSearchRequest
		if err := ctx.ShouldBindQuery(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// デフォルト値を設定
		req.SetDefaults()

		// バリデーション
		if err := a.Validator.Struct(req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		videos, total, err := a.VideoQuery.SearchVideos(req.Q, req.Page, req.Limit, req.Order, req.FilterBy)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_search_videos"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		totalPages := (int(total) + req.Limit - 1) / req.Limit
		ctx.JSON(http.StatusOK, dto.VideoListResponse{
			Data: videos,
			Pagination: dto.Pagination{
				Page:       req.Page,
				Limit:      req.Limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})

	// GET /api/v1/videos/:id
	// @Summary ビデオ詳細を取得
	// @Description 特定のビデオの詳細情報を取得します
	// @Tags Videos
	// @Param id path int true "ビデオID"
	// @Produce json
	// @Success 200 {object} entity.Video
	// @Failure 404 {object} dto.ErrorResponse
	// @Failure 500 {object} dto.ErrorResponse
	// @Router /api/v1/videos/{id} [get]
	videosGroup.GET("/:id", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		ctx.JSON(http.StatusOK, video)
	})

	// GET /api/v1/videos/:id/download
	// @Summary ビデオをダウンロード
	// @Description ビデオファイルをダウンロードします
	// @Tags Videos
	// @Param id path int true "ビデオID"
	// @Produce octet-stream
	// @Success 200 {file} file
	// @Failure 404 {object} dto.ErrorResponse
	// @Failure 500 {object} dto.ErrorResponse
	// @Router /api/v1/videos/{id}/download [get]
	videosGroup.GET("/:id/download", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// ファイルをダウンロード（実装は省略 - FilePath から実際のファイルを提供）
		ctx.File(video.FilePath)
	})

	// POST /api/v1/videos/:id/thumbnail/regenerate
	// @Summary サムネイルを再生成
	// @Description ビデオのサムネイルを再生成します
	// @Tags Videos
	// @Param id path int true "ビデオID"
	// @Param body body dto.ThumbnailRegenerateRequest false "リクエストボディ"
	// @Produce json
	// @Success 200 {object} dto.ThumbnailRegenerateResponse
	// @Failure 404 {object} dto.ErrorResponse
	// @Failure 500 {object} dto.ErrorResponse
	// @Router /api/v1/videos/{id}/thumbnail/regenerate [post]
	videosGroup.POST("/:id/thumbnail/regenerate", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		var req dto.ThumbnailRegenerateRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// サムネイル再生成ロジック（ここでは省略）
		// 実装例: FFmpeg を使用してサムネイルを生成

		ctx.JSON(http.StatusOK, dto.ThumbnailRegenerateResponse{
			ID:            video.ID,
			ThumbnailInfo: video.ThumbnailInfo,
			Message:       i18n.GetSuccessMessage(locale, "thumbnail_regenerated"),
		})
	})
}
