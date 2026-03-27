package handler

import (
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/hogecode/commentPlayer/internal/entity"
)

// RegisterStaticRoutes - 静的ファイルルートを登録
// Folders テーブルのパスを静的ファイルとして配信し、SPA のフォールバック処理を行う
func (a *App) RegisterStaticRoutes(engine *gin.Engine) {
	// Folders テーブルから監視対象フォルダを取得
	var folders []entity.Folder
	if err := a.DB.Where("is_watched = ?", true).Find(&folders).Error; err != nil {
		slog.Warn("RegisterStaticRoutes: Failed to fetch folders from database",
			"error", err.Error())
	} else {
		slog.Debug("RegisterStaticRoutes: Setting up static file routes for folders",
			"folder_count", len(folders))

		// 各フォルダを静的ファイルディレクトリとして登録
		for _, folder := range folders {
			if _, err := os.Stat(folder.Path); err == nil {
				// フォルダが存在する場合、ルートを登録
				// /files/:folderID/* でアクセス可能にする
				folderID := folder.ID
				folderPath := folder.Path

				// 相対パスを絶対パスに変換
				absPath, err := filepath.Abs(folderPath)
				if err != nil {
					slog.Warn("RegisterStaticRoutes: Failed to convert folder path to absolute path",
						"folder_id", folderID,
						"folder_path", folderPath,
						"error", err.Error())
					continue
				}

				// /files/id/* パターンでアクセス可能にする
				engine.Static("/files/"+string(rune(folderID)), absPath)

				slog.Info("RegisterStaticRoutes: Static file route registered",
					"folder_id", folderID,
					"folder_path", folderPath,
					"route", "/files/"+string(rune(folderID)))
			} else {
				slog.Warn("RegisterStaticRoutes: Folder does not exist",
					"folder_id", folder.ID,
					"folder_path", folder.Path,
					"error", err.Error())
			}
		}
	}

	// スクリーンショットの配信
	engine.Static("/screenshots", "./public/screenshots")

	// cd serverで実行していることに注意
	builtDir := "../apps/web/dist"

	// assets追加
	// ビルド済みのcssやjs
	engine.Static("/assets", filepath.Join(builtDir, "assets"))

	// index.html
	engine.GET("/", func(c *gin.Context) {
		c.File(filepath.Join(builtDir, "index.html"))
	})

	// SPA のフォールバック処理
	// 存在しないパスにアクセスされた場合、index.html を返す
	engine.NoRoute(func(c *gin.Context) {
		// API パスの場合は 404 を返す
		if strings.HasPrefix(c.Request.RequestURI, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Not found",
				"code":  "NOT_FOUND",
			})
			return
		}
		c.File(filepath.Join(builtDir, "index.html"))
	})

	slog.Info("RegisterStaticRoutes: Static routes and SPA fallback initialized")
}

// GetFileFromFolder - フォルダの ID から静的ファイルをダウンロード
// @Summary フォルダ内のファイルを取得
// @Description 指定されたフォルダ内のファイルを取得します
// @Tags Static Files
// @Param folderID path int true "フォルダID"
// @Param filepath path string true "ファイルパス"
// @Produce application/octet-stream
// @Success 200 {file} file
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/v1/files/{folderID}/{filepath} [get]
func (a *App) GetFileFromFolder(filesGroup *gin.RouterGroup) {
	// 静的ファイルはCORS制限が厳しいので、CORSプリフライトリクエスト（OPTIONS）に対応するルートも追加
	// CORSプリフライトリクエスト（OPTIONS）に対応
	filesGroup.OPTIONS("/:folderID/*filepath", func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Range, Content-Type")
		ctx.Header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")
		ctx.Header("Access-Control-Max-Age", "86400")
		ctx.Status(http.StatusNoContent)
	})

	filesGroup.GET("/:folderID/*filepath", func(ctx *gin.Context) {
		folderIDStr := ctx.Param("folderID")
		requestedFilePath := ctx.Param("filepath")

		// CORSヘッダーを設定（すべてのオリジンを許可）
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Range, Content-Type")
		ctx.Header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")

		slog.Debug("GetFileFromFolder: File requested",
			"folder_id", folderIDStr,
			"file_path", requestedFilePath)

		// フォルダ情報を取得
		var folder entity.Folder
		if err := a.DB.Where("id = ?", folderIDStr).First(&folder).Error; err != nil {
			slog.Warn("GetFileFromFolder: Folder not found",
				"folder_id", folderIDStr,
				"error", err.Error())
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "Folder not found",
				"code":  "FOLDER_NOT_FOUND",
			})
			return
		}

		// パストラバーサル攻撃を防ぐため、パスの妥当性をチェック
		filePath := filepath.Join(folder.Path, strings.TrimPrefix(requestedFilePath, "/"))
		absFilePath, err := filepath.Abs(filePath)
		if err != nil {
			slog.Warn("GetFileFromFolder: Failed to resolve absolute path",
				"folder_id", folderIDStr,
				"file_path", requestedFilePath,
				"error", err.Error())
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid file path",
				"code":  "INVALID_PATH",
			})
			return
		}

		// ファイルが folder.Path 内にあることを確認
		absFolderPath, _ := filepath.Abs(folder.Path)
		if !strings.HasPrefix(absFilePath, absFolderPath) {
			slog.Warn("GetFileFromFolder: Path traversal attempt detected",
				"folder_id", folderIDStr,
				"requested_path", requestedFilePath,
				"resolved_path", absFilePath,
				"folder_base_path", absFolderPath)
			ctx.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied",
				"code":  "ACCESS_DENIED",
			})
			return
		}

		// ファイルの存在確認
		if _, err := os.Stat(absFilePath); err != nil {
			slog.Warn("GetFileFromFolder: File not found",
				"folder_id", folderIDStr,
				"file_path", requestedFilePath,
				"error", err.Error())
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "File not found",
				"code":  "FILE_NOT_FOUND",
			})
			return
		}

		slog.Info("GetFileFromFolder: Serving file",
			"folder_id", folderIDStr,
			"file_path", requestedFilePath)

		ctx.File(absFilePath)
	})
}
