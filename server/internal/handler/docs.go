//go:build debug

package handler

import (
	_ "embed"
	"net/http"

	"github.com/gin-gonic/gin"
	files "github.com/swaggo/files"
	swagger "github.com/swaggo/gin-swagger"
)

//go:embed swagger.json
var swaggerJSON []byte

// GetSwaggerJSON - Swagger JSON を提供
// @Summary 埋め込み Swagger ドキュメントを提供（デバッグビルドのみ）
// @Description デバッグビルドでの埋め込みSwagger JSONドキュメント
// @Tags Debug
// @Produce application/json
// @Success 200 {object} map[string]interface{} "Swagger JSON"
// @Router /swagger.json [get]
func (a *App) GetSwaggerJSON(c *gin.Context) {
	c.Data(http.StatusOK, "application/json", swaggerJSON)
}

// RegisterDocsRoutes - Swagger API ドキュメント エンドポイントを登録（デバッグビルドのみ）
func (a *App) RegisterDocsRoutes(router *gin.RouterGroup) {
	// swagger.json を提供
	router.GET("/swagger.json", a.GetSwaggerJSON)

	// Swagger UI を提供
	if handler := swagger.WrapHandler(files.Handler, swagger.URL("/api/v1/swagger.json")); handler != nil {
		router.GET("/docs", handler)
		router.GET("/docs/*any", handler)
	}
}
