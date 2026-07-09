package handler

import (
	"github.com/go-playground/validator/v10"
	"github.com/hogecode/commentPlayer/internal/config"
	"github.com/hogecode/commentPlayer/internal/db"
	"github.com/hogecode/commentPlayer/internal/query"
	"github.com/hogecode/commentPlayer/internal/service"
	"github.com/hogecode/commentPlayer/internal/syobocal/api"
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
// @schemes http
type App struct {
	DB            *gorm.DB
	VideoQuery    *query.VideoQuery
	CaptureQuery  *query.CaptureQuery
	Queries       *db.Queries
	Validator     *validator.Validate
	FileWatcher   *service.FileWatcher
	Config        *config.Config
	JikkyoClient  *api.Client
}

// NewApp - Initialize a new App
func NewApp(dbConn *gorm.DB, cfg *config.Config) *App {
	// sqlcのQueries初期化（*sql.DBが必要）
	var sqlDB *db.Queries
	if sqlDB_obj, err := dbConn.DB(); err == nil {
		sqlDB = db.New(sqlDB_obj)
	}

	return &App{
		DB:           dbConn,
		VideoQuery:   query.NewVideoQuery(dbConn),
		CaptureQuery: query.NewCaptureQuery(dbConn),
		Queries:      sqlDB,
		Validator:    validator.New(),
		FileWatcher:  nil,
		Config:       cfg,
		JikkyoClient: api.NewClient(),
	}
}
