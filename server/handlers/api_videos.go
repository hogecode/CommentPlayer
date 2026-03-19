package handlers

import (
	"net/http"

	"github.com/hogecode/CommentVideo/dto"
	"github.com/labstack/echo/v4"
)

// ApiV1VideosGet - ビデオ一覧を取得
func (c *Container) ApiV1VideosGet(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}

// ApiV1VideosIdDownloadGet - ビデオをダウンロード
func (c *Container) ApiV1VideosIdDownloadGet(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}

// ApiV1VideosIdGet - ビデオ詳細を取得
func (c *Container) ApiV1VideosIdGet(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}

// ApiV1VideosIdThumbnailRegeneratePost - サムネイルを再生成
func (c *Container) ApiV1VideosIdThumbnailRegeneratePost(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}

// ApiV1VideosSearchGet - ビデオを検索
func (c *Container) ApiV1VideosSearchGet(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}
