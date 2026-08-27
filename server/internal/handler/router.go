package handler

import (
	"github.com/hogecode/commentPlayer/internal/service"
	"github.com/gin-gonic/gin"
)

func (a *App) RegisterRoutes(engine *gin.Engine, jwtSecret string) {
	// API v1 グループ
	v1 := engine.Group("/api/v1")

	// ユーザー関連ルートを登録
	usersGroup := v1.Group("/users")
	a.RegisterUserRoutes(usersGroup, jwtSecret)

	// 設定関連ルートを登録
	settingsGroup := v1.Group("/settings")
	a.RegisterSettingsRoutes(settingsGroup)

	// ビデオ関連ルートを登録
	videosGroup := v1.Group("/videos")
	a.RegisterVideoRoutes(videosGroup)

	// キャプチャ関連ルートを登録
	capturesGroup := v1.Group("/captures")
	a.RegisterCaptureRoutes(capturesGroup)

	// フォルダ関連ルートを登録
	foldersGroup := v1.Group("/folders")
	a.RegisterFolderRoutes(foldersGroup)

	// シリーズ関連ルートを登録
	seriesHandler := NewSeriesHandler(a.DB, a.Config)
	seriesGroup := v1.Group("/series")
	RegisterSeriesRoutes(seriesGroup, seriesHandler)

	// Syobocal 関連ルートを登録
	syobocalGroup := v1.Group("/syobocal")
	a.RegisterSyobocalRoutesHandler(syobocalGroup)

	// 静的ファイルダウンロード API ルートを登録
	filesGroup := v1.Group("/files")
	a.GetFileFromFolder(filesGroup)

	// 管理画面統計 API ルートを登録
	adminGroup := v1.Group("/admin")
	a.RegisterAdminRoutes(adminGroup)

	// 静的ファイル配信と SPA フォールバック処理を登録
	a.RegisterStaticRoutes(engine)
}

// RegisterAdminRoutes - 管理画面関連ルートを登録
func (a *App) RegisterAdminRoutes(group *gin.RouterGroup) {
	statsGroup := group.Group("/stats")

	// 統計サービスを初期化
	statsService := service.NewAdminStatsService(a.Queries)
	statsHandler := NewAdminStatsHandler(statsService)

	// ルートを登録
	statsGroup.GET("/monthly", statsHandler.GetMonthlyStats)
}
