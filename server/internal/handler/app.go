package handler

import (
	"github.com/go-playground/validator/v10"
	"github.com/hogecode/commentPlayer/internal/query"
	"gorm.io/gorm"
)

// App - API アプリケーションコンテナ
type App struct {
	DB           *gorm.DB
	VideoQuery   *query.VideoQuery
	CaptureQuery *query.CaptureQuery
	Validator    *validator.Validate
}

// NewApp - App を初期化
func NewApp(db *gorm.DB) *App {
	return &App{
		DB:           db,
		VideoQuery:   query.NewVideoQuery(db),
		CaptureQuery: query.NewCaptureQuery(db),
		Validator:    validator.New(),
	}
}
