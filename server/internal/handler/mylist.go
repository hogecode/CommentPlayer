package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/i18n"
)

// RegisterMylistRoutes - マイリスト関連ルートを登録
func (a *App) RegisterMylistRoutes(mylistGroup *gin.RouterGroup) {
	a.GetMylist(mylistGroup)
	a.AddToMylist(mylistGroup)
	a.RemoveFromMylist(mylistGroup)
	a.CheckInMylist(mylistGroup)
}

// GetMylist - マイリスト一覧を取得
// @Summary マイリスト一覧を取得
// @Description ユーザーのマイリスト一覧を取得します
// @Tags Mylist
// @Param page query int false "ページ番号" default(1)
// @Param limit query int false "1ページあたりのアイテム数" default(20)
// @Produce json
// @Success 200 {object} dto.MylistListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/mylist [get]
func (a *App) GetMylist(mylistGroup *gin.RouterGroup) {
	mylistGroup.GET("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// ページネーション情報を取得
		page := 1
		limit := 20
		if p := ctx.Query("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		if l := ctx.Query("limit"); l != "" {
			if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
				limit = parsed
			}
		}

		// ユーザーIDを取得
		userIDValue, exists := ctx.Get("user_id")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			return
		}
		userID, ok := userIDValue.(int)
		if !ok {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_user_id"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// マイリストを取得
		mylists, total, err := a.MylistQuery.GetMylist(userID, page, limit)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_mylist"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンスを構築
		data := make([]dto.MylistWithVideoResponse, 0, len(mylists))
		for _, mylist := range mylists {
			item := dto.MylistWithVideoResponse{
				ID:        mylist.ID,
				VideoID:   mylist.VideoID,
				Video:     mylist.Video,
				CreatedAt: mylist.CreatedAt,
				UpdatedAt: mylist.UpdatedAt,
			}
			data = append(data, item)
		}

		totalPages := (int(total) + limit - 1) / limit
		ctx.JSON(http.StatusOK, dto.MylistListResponse{
			Data: data,
			Pagination: dto.Pagination{
				Page:       page,
				Limit:      limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})
}

// AddToMylist - マイリストに追加
// @Summary マイリストに追加
// @Description 動画をマイリストに追加します
// @Tags Mylist
// @Param body body dto.MylistRequest true "リクエストボディ"
// @Produce json
// @Success 200 {object} dto.MylistResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/mylist [post]
func (a *App) AddToMylist(mylistGroup *gin.RouterGroup) {
	mylistGroup.POST("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.MylistRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// ユーザーIDを取得
		userIDValue, exists := ctx.Get("user_id")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			return
		}
		userID, ok := userIDValue.(int)
		if !ok {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_user_id"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		mylist, err := a.MylistQuery.AddToMylist(userID, req.VideoID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_add_mylist"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		ctx.JSON(http.StatusOK, dto.MylistResponse{
			ID:        mylist.ID,
			VideoID:   mylist.VideoID,
			CreatedAt: mylist.CreatedAt,
			UpdatedAt: mylist.UpdatedAt,
		})
	})
}

// RemoveFromMylist - マイリストから削除
// @Summary マイリストから削除
// @Description 動画をマイリストから削除します
// @Tags Mylist
// @Param videoID path int true "ビデオID"
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/mylist/:videoID [delete]
func (a *App) RemoveFromMylist(mylistGroup *gin.RouterGroup) {
	mylistGroup.DELETE("/:videoID", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		videoIDStr := ctx.Param("videoID")
		videoID, err := strconv.Atoi(videoIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// ユーザーIDを取得
		userIDValue, exists := ctx.Get("user_id")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			return
		}
		userID, ok := userIDValue.(int)
		if !ok {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_user_id"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		err = a.MylistQuery.RemoveFromMylist(userID, videoID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_remove_mylist"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": i18n.GetSuccessMessage(locale, "removed_from_mylist"),
		})
	})
}

// CheckInMylist - マイリスト登録済みかチェック
// @Summary マイリスト登録済みかチェック
// @Description 動画がマイリストに入っているかチェックします
// @Tags Mylist
// @Param videoID path int true "ビデオID"
// @Produce json
// @Success 200 {object} map[string]bool
// @Failure 400 {object} dto.ErrorResponse
// @Router /api/v1/mylist/:videoID/check [get]
func (a *App) CheckInMylist(mylistGroup *gin.RouterGroup) {
	mylistGroup.GET("/:videoID/check", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		videoIDStr := ctx.Param("videoID")
		videoID, err := strconv.Atoi(videoIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// ユーザーIDを取得
		userIDValue, exists := ctx.Get("user_id")
		if !exists {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			return
		}
		userID, ok := userIDValue.(int)
		if !ok {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_user_id"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		inMylist, err := a.MylistQuery.IsInMylist(userID, videoID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_check_mylist"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"in_mylist": inMylist,
		})
	})
}
