package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hogecode/commentPlayer/internal/db"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/query"
)

// ============ Router Registration ============

// RegisterCaptureRoutes - キャプチャ関連ルートを登録
func (a *App) RegisterCaptureRoutes(capturesGroup *gin.RouterGroup) {
	a.GetCapturesSeriesList(capturesGroup)
	a.GetCaptures(capturesGroup)
	a.GetCaptureByID(capturesGroup)
	a.CreateCapture(capturesGroup)
	a.DeleteCapture(capturesGroup)
}

// GetCapturesSeriesList - キャプチャが存在するシリーズ一覧を取得
// @Summary キャプチャ対応シリーズ一覧を取得
// @Description キャプチャが存在するシリーズのみの一覧を返します
// @Tags Captures
// @Produce json
// @Success 200 {object} dto.CapturesSeriesListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/captures/series [get]
func (a *App) GetCapturesSeriesList(capturesGroup *gin.RouterGroup) {
	capturesGroup.GET("/series", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// キャプチャが存在するシリーズ一覧を取得
		series, err := a.CaptureQuery.GetCapturesSeriesList()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// entity.Series から dto.CaptureSeriesInfo に変換
		seriesInfo := make([]dto.CaptureSeriesInfo, len(series))
		for i, s := range series {
			seriesInfo[i] = dto.CaptureSeriesInfo{
				ID:                  s.ID,
				SeriesNameFile:      s.SeriesNameFile,
				SyobocalTitleID:     s.SyobocalTitleID,
				SyobocalTitleName:   s.SyobocalTitleName,
				SyobocalTitleNameEn: s.SyobocalTitleNameEn,
				FirstYear:           s.FirstYear,
				FirstMonth:          s.FirstMonth,
			}
		}

		ctx.JSON(http.StatusOK, dto.CapturesSeriesListResponse{
			Data: seriesInfo,
		})
	})
}

// GetCaptures - キャプチャ一覧を取得
// @Summary キャプチャ一覧を取得
// @Description キャプチャ一覧をページネーション付きで取得します。series_id でシリーズ別フィルター、sort_key と sort_order でソートをカスタマイズできます
// @Tags Captures
// @Param video_id query int false "ビデオID（フィルタリング用）"
// @Param series_id query int false "シリーズID（フィルタリング用）"
// @Param page query int false "ページ番号" default(1)
// @Param limit query int false "1ページあたりのアイテム数" default(20)
// @Param sort_key query string false "ソート対象フィールド (id または created_at)" default(created_at) Enums(id,created_at)
// @Param sort_order query string false "ソート順序 (asc または desc)" default(desc) Enums(asc,desc)
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

		// ページネーション計算
		offset := int64((req.Page - 1) * req.Limit)

		// ソートキーとソート順序に応じて適切なクエリを選択
		// デフォルト: created_at DESC（新しい順）
		sortKey := req.SortKey
		sortOrder := req.SortOrder

		// シリーズIDでのフィルター優先（シリーズID > ビデオID）
		if req.SeriesID > 0 {
			// シリーズIDでフィルター：GORM使用（複雑なJOIN対応）
			var captures []entity.Capture
			var total int64

			// GetCapturesBySeries で取得
			captures, err := a.CaptureQuery.GetCapturesBySeries(query.GetCapturesBySeriesParams{
				SeriesID:  int64(req.SeriesID),
				SortKey:   sortKey,
				SortOrder: sortOrder,
				Limit:     int64(req.Limit),
				Offset:    offset,
			})

			if err != nil {
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}

			// 総数を取得
			total, err = a.CaptureQuery.CountCapturesBySeries(int64(req.SeriesID))
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}

			// entity.Capture を dto.Capture に変換
			capturesDTOs := make([]dto.Capture, len(captures))
			for i, c := range captures {
				capturesDTOs[i] = dto.Capture{
					ID:               int(c.ID),
					Filename:         c.Filename,
					VideoID:          int(c.VideoID),
					SaveDir:          c.SaveDir,
					SavePath:         c.SavePath,
					CreatedAt:        c.CreatedAt,
					PlaybackPosition: c.PlaybackPosition,
					CommentDelay:     c.CommentDelay,
				}
			}

			// レスポンス作成
			totalPages := (int(total) + req.Limit - 1) / req.Limit
			if totalPages == 0 {
				totalPages = 1
			}

			ctx.JSON(http.StatusOK, dto.CaptureListResponse{
				Data: capturesDTOs,
				Pagination: dto.Pagination{
					Page:       req.Page,
					Limit:      req.Limit,
					Total:      int(total),
					TotalPages: totalPages,
				},
			})
			return
		}

		// sqlcで生成されたキャプチャ取得・カウント関数を呼び出す
		var dbCaptures []db.Capture
		var total int64
		var err error

		if req.VideoID > 0 {
			// VideoIDでフィルター
			videoIDNull := sql.NullInt64{Int64: int64(req.VideoID), Valid: true}

			// ソートキーとソート順序の組み合わせに応じてクエリを切り替え
			if sortKey == "id" && sortOrder == "asc" {
				dbCaptures, err = a.Queries.GetCaptureListByVideoIdAsc(ctx, db.GetCaptureListByVideoIdAscParams{
					VideoID: videoIDNull,
					Limit:   int64(req.Limit),
					Offset:  offset,
				})
			} else if sortKey == "id" && sortOrder == "desc" {
				dbCaptures, err = a.Queries.GetCaptureListByVideoIdDesc(ctx, db.GetCaptureListByVideoIdDescParams{
					VideoID: videoIDNull,
					Limit:   int64(req.Limit),
					Offset:  offset,
				})
			} else if sortKey == "created_at" && sortOrder == "asc" {
				dbCaptures, err = a.Queries.GetCaptureListByVideoCreatedAtAsc(ctx, db.GetCaptureListByVideoCreatedAtAscParams{
					VideoID: videoIDNull,
					Limit:   int64(req.Limit),
					Offset:  offset,
				})
			} else {
				// created_at DESC がデフォルト
				dbCaptures, err = a.Queries.GetCaptureListByVideo(ctx, db.GetCaptureListByVideoParams{
					VideoID: videoIDNull,
					Limit:   int64(req.Limit),
					Offset:  offset,
				})
			}

			if err != nil {
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}
			total, err = a.Queries.CountCaptureListByVideo(ctx, videoIDNull)
		} else {
			// 全件取得

			// ソートキーとソート順序の組み合わせに応じてクエリを切り替え
			if sortKey == "id" && sortOrder == "asc" {
				dbCaptures, err = a.Queries.GetAllCapturesIdAsc(ctx, db.GetAllCapturesIdAscParams{
					Limit:  int64(req.Limit),
					Offset: offset,
				})
			} else if sortKey == "id" && sortOrder == "desc" {
				dbCaptures, err = a.Queries.GetAllCapturesIdDesc(ctx, db.GetAllCapturesIdDescParams{
					Limit:  int64(req.Limit),
					Offset: offset,
				})
			} else if sortKey == "created_at" && sortOrder == "asc" {
				dbCaptures, err = a.Queries.GetAllCapturesCreatedAtAsc(ctx, db.GetAllCapturesCreatedAtAscParams{
					Limit:  int64(req.Limit),
					Offset: offset,
				})
			} else {
				// created_at DESC がデフォルト
				dbCaptures, err = a.Queries.GetAllCaptures(ctx, db.GetAllCapturesParams{
					Limit:  int64(req.Limit),
					Offset: offset,
				})
			}

			if err != nil {
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}
			total, err = a.Queries.CountAllCaptures(ctx)
		}

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_captures"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// db.Captureをdto.Captureに変換
		captures := make([]dto.Capture, len(dbCaptures))
		for i, dbCapture := range dbCaptures {
			captures[i] = dto.Capture{
				ID:               int(dbCapture.ID),
				Filename:         dbCapture.Filename.String,
				VideoID:          int(dbCapture.VideoID.Int64),
				SaveDir:          dbCapture.SaveDir.String,
				SavePath:         dbCapture.SavePath.String,
				PlaybackPosition: dbCapture.PlaybackPosition.Float64,
				CommentDelay:     dbCapture.CommentDelay.Float64,
				CreatedAt:        dbCapture.CreatedAt.Time,
			}
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

// GetCaptureByID - キャプチャを取得
// @Summary キャプチャを取得
// @Description キャプチャをIDで取得します
// @Tags Captures
// @Param id path int true "キャプチャID"
// @Produce json
// @Success 200 {object} entity.Capture
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/captures/{id} [get]
func (a *App) GetCaptureByID(capturesGroup *gin.RouterGroup) {
	capturesGroup.GET("/:id", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// IDを取得
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// sqlcで生成されたGetCaptureByIDを呼び出す
		dbCapture, err := a.Queries.GetCaptureByID(ctx, int64(id))
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "capture_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// DB モデル（db.Capture）をエンティティ（entity.Capture）に変換
		capture := entity.Capture{
			ID:               int(dbCapture.ID),
			Filename:         dbCapture.Filename.String,
			VideoID:          int(dbCapture.VideoID.Int64),
			SaveDir:          dbCapture.SaveDir.String,
			SavePath:         dbCapture.SavePath.String,
			CreatedAt:        dbCapture.CreatedAt.Time,
			PlaybackPosition: dbCapture.PlaybackPosition.Float64,
			CommentDelay:     dbCapture.CommentDelay.Float64,
		}

		// レスポンス
		ctx.JSON(http.StatusOK, capture)
	})
}

// CreateCapture - キャプチャを作成
// @Summary キャプチャを作成
// @Description 新しいキャプチャを作成します
// @Tags Captures
// @Param file formData file true "キャプチャファイル"
// @Param video_id formData int true "ビデオID"
// @Param playback_position formData number false "ビデオの再生位置（秒）"
// @Param comment_delay formData number false "コメント遅延秒数"
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

		// playback_position と comment_delay を取得（オプション）
		playbackPositionStr := ctx.PostForm("playback_position")
		var playbackPosition float64
		if playbackPositionStr != "" {
			pos, err := strconv.ParseFloat(playbackPositionStr, 64)
			if err == nil {
				playbackPosition = pos
			}
		}

		commentDelayStr := ctx.PostForm("comment_delay")
		var commentDelay float64
		if commentDelayStr != "" {
			delay, err := strconv.ParseFloat(commentDelayStr, 64)
			if err == nil {
				commentDelay = delay
			}
		}

		// ビデオの存在確認
		video, err := a.VideoQuery.GetVideoByID(videoID)
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

		// Capture エンティティを作成（まずIDを取得するために先にDBに保存）
		capture := entity.Capture{
			Filename:         file.Filename,
			VideoID:          videoID,
			PlaybackPosition: playbackPosition,
			CommentDelay:     commentDelay,
			CreatedAt:        time.Now(),
		}

		// DB処理をqueryパッケージに委譲（IDを自動生成させる）
		if err := a.CaptureQuery.CreateCapture(&capture); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_create_capture"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// IDを取得した後、ビデオファイル名を含めたキャプチャファイル名を生成
		// ファイル名形式: {videoFileName}_{captureID}_{ext}
		ext := filepath.Ext(file.Filename)
		videoFileNameWithoutExt := video.FileName[:len(video.FileName)-len(filepath.Ext(video.FileName))]
		saveFileName := fmt.Sprintf("%s_%d%s", videoFileNameWithoutExt, capture.ID, ext)
		savePath := filepath.Join(capturesDir, saveFileName)

		// ファイルを保存
		if err := ctx.SaveUploadedFile(file, savePath); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_capture_file"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// SaveDir と SavePath を設定して更新
		capture.SaveDir = capturesDir
		capture.SavePath = savePath
		capture.Filename = saveFileName // DBに保存するファイル名を更新

		// DBに更新
		if err := a.CaptureQuery.UpdateCapture(&capture); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_capture_file"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// 作成した情報でレスポンスを返す
		ctx.JSON(http.StatusCreated, capture)
	})
}

// DeleteCapture - キャプチャを削除
// @Summary キャプチャを削除
// @Description キャプチャをファイルシステムとDBから削除します
// @Tags Captures
// @Param id path int true "キャプチャID"
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/captures/{id} [delete]
func (a *App) DeleteCapture(capturesGroup *gin.RouterGroup) {
	capturesGroup.DELETE("/:id", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// IDを取得
		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// キャプチャを取得
		capture, err := a.CaptureQuery.GetCaptureByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "capture_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// ファイルシステムからファイルを削除
		if capture.SavePath != "" {
			if err := os.Remove(capture.SavePath); err != nil && !os.IsNotExist(err) {
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_delete_capture_file"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}
		}

		// DBから削除
		if err := a.CaptureQuery.DeleteCapture(id); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_delete_capture"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// 削除成功レスポンス
		ctx.JSON(http.StatusOK, dto.SuccessResponse{
			Message: i18n.GetErrorMessage(locale, "capture_deleted"),
		})
	})
}
