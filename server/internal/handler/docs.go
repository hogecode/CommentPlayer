//go:build debug

package handler

import (
	"bytes"
	_ "embed"
	"net/http"

	"github.com/gin-gonic/gin"
	files "github.com/swaggo/files"
	swagger "github.com/swaggo/gin-swagger"
)

//go:embed swagger.json
var swaggerJSON []byte

// RegisterDocsRoutes - Swagger API ドキュメント エンドポイントを登録（デバッグビルドのみ）
// @Summary 埋め込み Swagger ドキュメントを提供（デバッグビルドのみ）
// @Id GetDocs
// @Tags Debug
// @Produce json
// @Success 200 {object} gin.H "Swagger JSON"
// @Router /swagger.json [get]
func (a *App) RegisterDocsRoutes(router *gin.RouterGroup) {
	// swagger.json を提供
	router.GET("swagger.json", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/json", swaggerJSON)
	})

	// Swagger UI を提供
	if handler := swagger.WrapHandler(files.Handler, swagger.URL("/api/v1/swagger.json")); handler != nil {
		router.GET("/docs", handler)
		router.GET("/docs/*any", handler)
	}
}
