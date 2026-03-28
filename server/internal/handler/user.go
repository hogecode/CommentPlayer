package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/middleware"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// RegisterUserRoutes - ユーザー関連ルートを登録
func (a *App) RegisterUserRoutes(userGroup *gin.RouterGroup, jwtSecret string) {
	userGroup.POST("", a.CreateUser)
	userGroup.POST("/token", func(ctx *gin.Context) {
		a.GetAccessToken(ctx, jwtSecret)
	})
	userGroup.GET("/me", middleware.JWTAuthMiddleware(jwtSecret), a.GetCurrentUser)
	userGroup.PUT("/me", middleware.JWTAuthMiddleware(jwtSecret), a.UpdateCurrentUser)
	userGroup.DELETE("/me", middleware.JWTAuthMiddleware(jwtSecret), a.DeleteCurrentUser)
	userGroup.GET("", middleware.JWTAuthMiddleware(jwtSecret), a.GetAllUsers)
	userGroup.GET("/:username", middleware.JWTAuthMiddleware(jwtSecret), a.GetUserByUsername)
	userGroup.PUT("/:username", middleware.JWTAuthMiddleware(jwtSecret), a.UpdateUser)
	userGroup.DELETE("/:username", middleware.JWTAuthMiddleware(jwtSecret), a.DeleteUser)
}

// CreateUser - ユーザー作成
// @Summary ユーザーアカウント作成
// @Description 新しいユーザーアカウントを作成します
// @Tags Users
// @Param body body dto.UserCreateRequest true "ユーザー作成リクエスト"
// @Produce json
// @Success 201 {object} entity.User
// @Failure 422 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/users [post]
func (a *App) CreateUser(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

	var req dto.UserCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
			Code:  "VALIDATION_ERROR",
		})
		return
	}

	// パスワードと確認用パスワードが一致するか確認
	if req.Password != req.ConfirmPassword {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Passwords do not match",
			Code:  "PASSWORD_MISMATCH",
		})
		return
	}

	// ユーザー名の重複チェック
	var existingUser entity.User
	if result := a.DB.Where("name = ?", req.Username).First(&existingUser); result.Error == nil {
		ctx.JSON(http.StatusUnprocessableEntity, dto.ErrorResponse{
			Error: "Username already exists",
			Code:  "DUPLICATE_USERNAME",
		})
		return
	}

	// パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "internal_error"),
			Code:  "INTERNAL_ERROR",
		})
		return
	}

	// 最初のユーザーの場合は管理者権限を付与
	isAdmin := 0
	var count int64
	a.DB.Model(&entity.User{}).Count(&count)
	if count == 0 {
		isAdmin = 1
	}

	// ユーザーを作成
	user := entity.User{
		Name:     req.Username,
		Password: string(hashedPassword),
		IsAdmin:  isAdmin,
	}

	if result := a.DB.Create(&user); result.Error != nil {
		ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "internal_error"),
			Code:  "INTERNAL_ERROR",
		})
		return
	}

	ctx.JSON(http.StatusCreated, user)
}

// GetAccessToken - アクセストークン発行（OAuth2準拠）
// @Summary アクセストークン発行 API (OAuth2 準拠)
// @Description ユーザーの認証情報を検証し、JWT トークンを発行します
// @Tags Users
// @Param body body dto.UserAccessTokenRequest true "ユーザー名とパスワード"
// @Produce json
// @Success 200 {object} dto.UserAccessToken
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/v1/users/token [post]
func (a *App) GetAccessToken(ctx *gin.Context, jwtSecret string) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

	var req dto.UserAccessTokenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
			Code:  "VALIDATION_ERROR",
		})
		return
	}

	// ユーザーを取得
	var user entity.User
	if result := a.DB.Where("name = ?", req.Username).First(&user); result.Error == gorm.ErrRecordNotFound {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Incorrect username or password",
			Code:  "UNAUTHORIZED",
		})
		return
	}

	// パスワードを検証
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "Incorrect username or password",
			Code:  "UNAUTHORIZED",
		})
		return
	}

	// JWT トークンを生成
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, middleware.JWTClaims{
		Issuer:   "commentPlayer Server",
		Type:     "AccessToken",
		Subject:  strconv.Itoa(user.ID),
		ID:       "jti",
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().AddDate(0, 0, 180)),
		},
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "internal_error"),
			Code:  "INTERNAL_ERROR",
		})
		return
	}

	ctx.JSON(http.StatusOK, dto.UserAccessToken{
		AccessToken: tokenString,
		TokenType:   "bearer",
	})
}

// GetCurrentUser - 現在のユーザー情報を取得
func (a *App) GetCurrentUser(ctx *gin.Context) {
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
		ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "user_not_found"),
			Code:  "NOT_FOUND",
		})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// UpdateCurrentUser - 現在のユーザー情報を更新
func (a *App) UpdateCurrentUser(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	var req dto.UserUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
			Code:  "VALIDATION_ERROR",
		})
		return
	}

	var user entity.User
	if result := a.DB.First(&user, userID); result.Error != nil {
		ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "user_not_found"),
			Code:  "NOT_FOUND",
		})
		return
	}

	if req.Username != nil {
		user.Name = *req.Username
	}
	if req.Password != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}

	a.DB.Save(&user)
	ctx.JSON(http.StatusOK, user)
}

// DeleteCurrentUser - 現在のユーザーを削除
func (a *App) DeleteCurrentUser(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	a.DB.Delete(&entity.User{}, userID)
	ctx.JSON(http.StatusNoContent, nil)
}

// GetAllUsers - すべてのユーザーを取得（管理者用）
func (a *App) GetAllUsers(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	// 管理者であることを確認
	var user entity.User
	if result := a.DB.First(&user, userID); result.Error != nil || user.IsAdmin == 0 {
		ctx.JSON(http.StatusForbidden, dto.ErrorResponse{
			Error: "Only admin can access this resource",
			Code:  "FORBIDDEN",
		})
		return
	}

	var users []entity.User
	a.DB.Find(&users)
	ctx.JSON(http.StatusOK, dto.UsersResponse{Data: users})
}

// GetUserByUsername - ユーザー名でユーザーを取得
func (a *App) GetUserByUsername(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	username := ctx.Param("username")

	var user entity.User
	if result := a.DB.Where("name = ?", username).First(&user); result.Error != nil {
		ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "user_not_found"),
			Code:  "NOT_FOUND",
		})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// UpdateUser - ユーザーを更新（管理者用）
func (a *App) UpdateUser(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	// 管理者確認
	var currentUser entity.User
	if result := a.DB.First(&currentUser, userID); result.Error != nil || currentUser.IsAdmin == 0 {
		ctx.JSON(http.StatusForbidden, dto.ErrorResponse{
			Error: "Only admin can access this resource",
			Code:  "FORBIDDEN",
		})
		return
	}

	username := ctx.Param("username")
	var user entity.User
	if result := a.DB.Where("name = ?", username).First(&user); result.Error != nil {
		ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "user_not_found"),
			Code:  "NOT_FOUND",
		})
		return
	}

	var req dto.UserUpdateRequestForAdmin
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
			Code:  "VALIDATION_ERROR",
		})
		return
	}

	if req.IsAdmin != nil {
		user.IsAdmin = 0
		if *req.IsAdmin {
			user.IsAdmin = 1
		}
	}

	a.DB.Save(&user)
	ctx.JSON(http.StatusOK, user)
}

// DeleteUser - ユーザーを削除（管理者用）
func (a *App) DeleteUser(ctx *gin.Context) {
	locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "unauthorized"),
			Code:  "UNAUTHORIZED",
		})
		return
	}

	// 管理者確認
	var currentUser entity.User
	if result := a.DB.First(&currentUser, userID); result.Error != nil || currentUser.IsAdmin == 0 {
		ctx.JSON(http.StatusForbidden, dto.ErrorResponse{
			Error: "Only admin can access this resource",
			Code:  "FORBIDDEN",
		})
		return
	}

	username := ctx.Param("username")
	var user entity.User
	if result := a.DB.Where("name = ?", username).First(&user); result.Error != nil {
		ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: i18n.GetErrorMessage(locale, "user_not_found"),
			Code:  "NOT_FOUND",
		})
		return
	}

	a.DB.Delete(&user)
	ctx.JSON(http.StatusNoContent, nil)
}
