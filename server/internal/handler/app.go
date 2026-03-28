package handler

import (
	"github.com/go-playground/validator/v10"
	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/query"
	"github.com/hogecode/commentPlayer/internal/service"
	"gorm.io/gorm"

	_ "github.com/gin-gonic/gin" // Swagger用のインポート
)

// App - API アプリケーションコンテナ
// @title commentPlayer API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host 100.72.160.115:8000 
type App struct {
	DB           *gorm.DB
	VideoQuery   *query.VideoQuery
	CaptureQuery *query.CaptureQuery
	MylistQuery  *query.MylistQuery
	Validator    *validator.Validate
	FileWatcher  *service.FileWatcher
	Config       *config.Config
}

// NewApp - App を初期化
func NewApp(db *gorm.DB, cfg *config.Config) *App {
	return &App{
		DB:           db,
		VideoQuery:   query.NewVideoQuery(db),
		CaptureQuery: query.NewCaptureQuery(db),
		Validator:    validator.New(),
		FileWatcher:  nil,
		Config:       cfg,
	}
}
