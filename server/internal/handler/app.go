package handler

import (
	"github.com/go-playground/validator/v10"
	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/query"
	"github.com/hogecode/commentPlayer/internal/service"
	"gorm.io/gorm"

	_ "github.com/gin-gonic/gin" 
)

// Please write comments in English only.
// Do not write non-Ascii(japanese) comments in this file, 
// because it is used for generating Swagger documentation and non-Ascii characters may cause issues in the generated JSON. 

// App - CommentPlayer API
// @title commentPlayer API
// @version 1.0.0
// @description Watch commentPlayer API documentation
// @host localhost:8000
// @schemes http
type App struct {
	DB           *gorm.DB
	VideoQuery   *query.VideoQuery
	CaptureQuery *query.CaptureQuery
	Validator    *validator.Validate
	FileWatcher  *service.FileWatcher
	Config       *config.Config
}

// NewApp - Initialize a new App
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
