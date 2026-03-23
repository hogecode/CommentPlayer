package handler

import (
	"github.com/go-playground/validator/v10"
	"github.com/hogecode/commentPlayer/internal/query"
	"github.com/hogecode/commentPlayer/internal/service"
	"gorm.io/gorm"

	_ "github.com/gin-gonic/gin" // Swagger用のインポート
)

// App - API アプリケーションコンテナ
// @title commentPlayer API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host localhost:8000
// @BasePath /api/v1
type App struct {
	DB           *gorm.DB
	VideoQuery   *query.VideoQuery
	CaptureQuery *query.CaptureQuery
	Validator    *validator.Validate
	FileWatcher  *service.FileWatcher
}

// NewApp - App を初期化
func NewApp(db *gorm.DB) *App {
	return &App{
		DB:           db,
		VideoQuery:   query.NewVideoQuery(db),
		CaptureQuery: query.NewCaptureQuery(db),
		Validator:    validator.New(),
		FileWatcher:  nil,
	}
}
