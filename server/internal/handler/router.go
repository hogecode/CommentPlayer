package handler

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes - ルートを登録
// @title commentPlayer API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host localhost:8000
// @basePath /
func (a *App) RegisterRoutes(engine *gin.Engine) {
	// API v1 グループ
	v1 := engine.Group("/api/v1")

	// ビデオ関連ルートを登録
	videosGroup := v1.Group("/videos")
	a.RegisterVideoRoutes(videosGroup)

	// キャプチャ関連ルートを登録
	capturesGroup := v1.Group("/captures")
	a.RegisterCaptureRoutes(capturesGroup)
}
