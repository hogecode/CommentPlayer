//go:build !debug

package handler

import (
	"github.com/gin-gonic/gin"
)

// RegisterDocsRoutes - プロダクションビルドではドキュメント機能を無効化
func (a *App) RegisterDocsRoutes(router *gin.RouterGroup) {
	// プロダクションビルドではなにもしない
}
