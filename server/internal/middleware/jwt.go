package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/i18n"
)

// JWTClaims - JWT クレーム
type JWTClaims struct {
	Issuer    string `json:"iss"`
	Type      string `json:"typ"`
	Subject   string `json:"sub"`
	ID        string `json:"jti"`
	IssuedAt  int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
	jwt.RegisteredClaims
}

// JWTAuthMiddleware - JWT 認証ミドルウェア
func JWTAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// Authorization ヘッダーから Bearer トークンを取得
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		// "Bearer " プレフィックスを削除
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		tokenString := parts[1]

		// JWT トークンをパース・検証
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// アルゴリズムが HS256 であることを確認
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		// クレームを取得
		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		// トークン type が AccessToken であることを確認
		if claims.Type != "AccessToken" {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		// Subject が存在することを確認
		if claims.Subject == "" {
			ctx.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "unauthorized"),
				Code:  "UNAUTHORIZED",
			})
			ctx.Abort()
			return
		}

		// user_id をコンテキストに設定（Subject はユーザーID）
		// Subject を int に変換して設定
		userID := 0
		fmt.Sscanf(claims.Subject, "%d", &userID)
		ctx.Set("user_id", userID)

		ctx.Next()
	}
}
