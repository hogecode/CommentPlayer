package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger - リクエストログミドルウェア
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// リクエスト情報
		method := c.Request.Method
		path := c.Request.RequestURI

		// リクエスト処理
		c.Next()

		// レスポンス情報
		statusCode := c.Writer.Status()
		latency := time.Since(startTime)

		// ログ出力
		log.Printf("[%s] %s %s %d (%v)\n", method, path, c.ClientIP(), statusCode, latency)
	}
}
