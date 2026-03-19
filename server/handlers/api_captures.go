package handlers

import (
	"net/http"

	"github.com/hogecode/CommentVideo/dto"
	"github.com/labstack/echo/v4"
)

// ApiV1CapturesGet - キャプチャ一覧を取得
func (c *Container) ApiV1CapturesGet(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}

// ApiV1CapturesPost - キャプチャを作成
func (c *Container) ApiV1CapturesPost(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, dto.HelloWorld{
		Message: "Hello World",
	})
}
