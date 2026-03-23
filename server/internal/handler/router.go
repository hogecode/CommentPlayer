package handler

import (
	"github.com/gin-gonic/gin"
)

func (a *App) RegisterRoutes(engine *gin.Engine) {
	// API v1 グループ
	v1 := engine.Group("/api/v1")

	// ビデオ関連ルートを登録
	videosGroup := v1.Group("/videos")
	a.RegisterVideoRoutes(videosGroup)

	// キャプチャ関連ルートを登録
	capturesGroup := v1.Group("/captures")
	a.RegisterCaptureRoutes(capturesGroup)

	// フォルダ関連ルートを登録
	foldersGroup := v1.Group("/folders")
	a.RegisterFolderRoutes(foldersGroup)
}
