package main

import (
	"github.com/hogecode/CommentVideo/handlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	//todo: handle the error!
	c, _ := handlers.NewContainer()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// ApiV1CapturesGet - キャプチャ一覧を取得
	e.GET("/api/v1/captures", c.ApiV1CapturesGet)

	// ApiV1CapturesPost - キャプチャを作成
	e.POST("/api/v1/captures", c.ApiV1CapturesPost)

	// ApiV1VideosGet - ビデオ一覧を取得
	e.GET("/api/v1/videos", c.ApiV1VideosGet)

	// ApiV1VideosIdDownloadGet - ビデオをダウンロード
	e.GET("/api/v1/videos/:id/download", c.ApiV1VideosIdDownloadGet)

	// ApiV1VideosIdGet - ビデオ詳細を取得
	e.GET("/api/v1/videos/:id", c.ApiV1VideosIdGet)

	// ApiV1VideosIdThumbnailRegeneratePost - サムネイルを再生成
	e.POST("/api/v1/videos/:id/thumbnail/regenerate", c.ApiV1VideosIdThumbnailRegeneratePost)

	// ApiV1VideosSearchGet - ビデオを検索
	e.GET("/api/v1/videos/search", c.ApiV1VideosSearchGet)

	// Start server
	e.Logger.Fatal(e.Start(":8000"))
}
