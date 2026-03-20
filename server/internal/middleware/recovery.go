package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Recovery - パニック復帰ミドルウェア
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
					"code":  "INTERNAL_ERROR",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
