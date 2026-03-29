package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/middleware"
	"gorm.io/gorm"
)

// RegisterSettingsRoutes - 設定関連ルートを登録
func (a *App) RegisterSettingsRoutes(settingsGroup *gin.RouterGroup) {
	settingsGroup.GET("/client", middleware.JWTAuthMiddleware(a.Config.Server.JWTSecret), a.GetClientSettings)
	settingsGroup.PUT("/client", middleware.JWTAuthMiddleware(a.Config.Server.JWTSecret), a.UpdateClientSettings)
}

// GetClientSettings - クライアント設定取得
// @Summary クライアント設定取得 API
// @Description ログイン中のユーザーアカウントのクライアント設定を取得する
// @Tags Settings
// @Security Bearer
// @Produce json
// @Success 200 {object} dto.ClientSettingsDTO
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/settings/client [get]
func (a *App) GetClientSettings(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	var user entity.User
	if result := a.DB.First(&user, userID); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "user_not_found"),
				Code:  "NOT_FOUND",
			})
		} else {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "internal_error"),
				Code:  "INTERNAL_ERROR",
			})
		}
		return
	}

	// ClientSettingsJSONをClientSettingsDTOに変換
	var settings dto.ClientSettingsDTO
	if len(user.ClientSettingsJSON) > 0 {
		if err := json.Unmarshal(user.ClientSettingsJSON, &settings); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "internal_error"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}
	}

	ctx.JSON(http.StatusOK, settings)
}

// UpdateClientSettings - クライアント設定更新
// @Summary クライアント設定更新 API
// @Description ログイン中のユーザーアカウントのクライアント設定を更新する
// @Tags Settings
// @Security Bearer
// @Param body body dto.ClientSettingsDTO true "更新するクライアント設定のデータ"
// @Success 204
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/settings/client [put]
func (a *App) UpdateClientSettings(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	var req dto.ClientSettingsDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
			Code:  "VALIDATION_ERROR",
		})
		return
	}

	var user entity.User
	if result := a.DB.First(&user, userID); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "user_not_found"),
				Code:  "NOT_FOUND",
			})
		} else {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "internal_error"),
				Code:  "INTERNAL_ERROR",
			})
		}
		return
	}

	// 現在サーバーに保存されているクライアント設定を取得
	var currentSettings dto.ClientSettingsDTO
	if len(user.ClientSettingsJSON) > 0 {
		if err := json.Unmarshal(user.ClientSettingsJSON, &currentSettings); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "internal_error"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}
	}

	// 現在サーバーに保存されているクライアント設定とマージして更新
	// UpdateClientSettingsRequestをClientSettingsDTOに変換
	newSettings := dto.ClientSettingsDTO{
		VideoWatchedHistoryMaxCount:                     req.VideoWatchedHistoryMaxCount,
		SyncSettings:                                    req.SyncSettings,
		LastSyncedAt:                                    time.Now().UnixMilli(),
		CommentSpeedRate:                                req.CommentSpeedRate,
		CommentFontSize:                                 req.CommentFontSize,
		CloseCommentFormAfterSending:                    req.CloseCommentFormAfterSending,
		MaxCommentsDisplayCount:                         req.MaxCommentsDisplayCount,
		DefaultCommentColor:                             req.DefaultCommentColor,
		MuteFixedComments:                               req.MuteFixedComments,
		MuteColoredComments:                             req.MuteColoredComments,
		MuteBigSizeComments:                             req.MuteBigSizeComments,
		MuteVulgarComments:                              req.MuteVulgarComments,
		MuteAbusiveDiscriminatoryPrejudicedComments:     req.MuteAbusiveDiscriminatoryPrejudicedComments,
		MuteConsecutiveSameCharactersComments:           req.MuteConsecutiveSameCharactersComments,
		MutedCommentKeywords:                            req.MutedCommentKeywords,
		MutedNiconicoUserIds:                            req.MutedNiconicoUserIds,
		MuteCommentKeywordsNormalizeAlphanumericWidthCase: req.MuteCommentKeywordsNormalizeAlphanumericWidthCase,
		Mylist:                                          req.Mylist,
		WatchedHistory:                                  req.WatchedHistory,
	}

	// ClientSettingsDTOをJSONに変換
	settingsJSON, err := json.Marshal(newSettings)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "internal_error"),
			Code:  "INTERNAL_ERROR",
		})
		return
	}

	// ClientSettingsJSONを更新
	user.ClientSettingsJSON = settingsJSON

	// レコードを保存
	if result := a.DB.Save(&user); result.Error != nil {
		ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "internal_error"),
			Code:  "INTERNAL_ERROR",
		})
		return
	}

	ctx.Status(http.StatusNoContent)
}
