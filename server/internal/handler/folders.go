package handler

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
)

// RegisterFolderRoutes - フォルダ関連ルートを登録
func (a *App) RegisterFolderRoutes(foldersGroup *gin.RouterGroup) {
	a.GetFolders(foldersGroup)
	a.AddFolder(foldersGroup)
	a.RemoveFolder(foldersGroup)
}

// GetFolders - 監視対象フォルダ一覧を取得
// @Summary 監視対象フォルダ一覧を取得
// @Description 監視対象フォルダの一覧を取得します
// @Tags Folders
// @Produce json
// @Success 200 {object} dto.FolderListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/folders [get]
func (a *App) GetFolders(foldersGroup *gin.RouterGroup) {
	foldersGroup.GET("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))
		slog.Debug("GetFolders: Starting to fetch all watched folders")

		var folders []entity.Folder
		if err := a.DB.Where("is_watched = ?", true).Find(&folders).Error; err != nil {
			slog.Error("GetFolders: Database error while fetching folders",
				"error", err.Error(),
				"locale", locale)
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_folders"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// Entityをレスポンスに変換
		response := make([]dto.FolderResponse, len(folders))
		for i, folder := range folders {
			response[i] = dto.FolderResponse{
				ID:        folder.ID,
				Path:      folder.Path,
				IsWatched: folder.IsWatched,
				CreatedAt: folder.CreatedAt,
				UpdatedAt: folder.UpdatedAt,
			}
		}

		slog.Info("GetFolders: Successfully retrieved watched folders",
			"folder_count", len(folders))
		ctx.JSON(http.StatusOK, dto.FolderListResponse{
			Data: response,
		})
	})
}

// AddFolder - 監視対象フォルダを追加
// @Summary 監視対象フォルダを追加
// @Description 新しいフォルダを監視対象に追加します
// @Tags Folders
// @Param body body dto.FolderRequest true "フォルダパス"
// @Produce json
// @Success 201 {object} dto.FolderActionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/folders [post]
func (a *App) AddFolder(foldersGroup *gin.RouterGroup) {
	foldersGroup.POST("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.FolderRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			slog.Warn("AddFolder: Invalid request body",
				"error", err.Error(),
				"locale", locale)
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		slog.Debug("AddFolder: Attempting to add folder", "path", req.Path)

		// FileWatcherの状態をログ
		if a.FileWatcher == nil {
			slog.Warn("AddFolder: FileWatcher is not initialized (nil)")
		} else {
			slog.Debug("AddFolder: FileWatcher is initialized")
		}

		// フォルダが既に存在するかチェック
		var existingFolder entity.Folder
		result := a.DB.Where("path = ?", req.Path).First(&existingFolder)
		if result.Error == nil {
			// 既に存在するフォルダの場合、is_watchedをtrueにする
			slog.Debug("AddFolder: Folder already exists, updating is_watched flag",
				"folder_id", existingFolder.ID,
				"path", req.Path)

			if err := a.DB.Model(&existingFolder).Update("is_watched", true).Error; err != nil {
				slog.Error("AddFolder: Failed to update existing folder",
					"folder_id", existingFolder.ID,
					"path", req.Path,
					"error", err.Error())
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_update_folder"),
					Code:  "INTERNAL_ERROR",
				})
				return
			}

			// FileWatcherに追加
			if a.FileWatcher != nil {
				slog.Debug("AddFolder: Adding existing folder to FileWatcher",
					"folder_id", existingFolder.ID,
					"path", req.Path)
				if err := a.FileWatcher.AddFolder(&existingFolder); err != nil {
					slog.Warn("AddFolder: Failed to add folder to FileWatcher",
						"folder_id", existingFolder.ID,
						"path", req.Path,
						"error", err.Error())
				} else {
					slog.Debug("AddFolder: Successfully added existing folder to FileWatcher",
						"folder_id", existingFolder.ID,
						"path", req.Path)
				}
			} else {
				slog.Warn("AddFolder: FileWatcher is nil, cannot add existing folder")
			}
            
			slog.Debug("AddFolder: Existing folder updated successfully",
				"folder_id", existingFolder.ID,
				"path", req.Path)
				
			response := dto.FolderResponse{
				ID:        existingFolder.ID,
				Path:      existingFolder.Path,
				IsWatched: true,
				CreatedAt: existingFolder.CreatedAt,
				UpdatedAt: existingFolder.UpdatedAt,
			}

			slog.Info("AddFolder: Existing folder updated successfully",
				"folder_id", existingFolder.ID,
				"path", req.Path)
			ctx.JSON(http.StatusCreated, dto.FolderActionResponse{
				Success: true,
				Message: i18n.GetSuccessMessage(locale, "folder_added"),
				Data:    &response,
			})
			return
		}

		// 新規フォルダを作成
		slog.Debug("AddFolder: Creating new folder record", "path", req.Path)
		newFolder := entity.Folder{
			Path:      req.Path,
			IsWatched: true,
		}

		if err := a.DB.Create(&newFolder).Error; err != nil {
			slog.Error("AddFolder: Failed to create folder record",
				"path", req.Path,
				"error", err.Error())
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_create_folder"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		slog.Debug("AddFolder: Folder record created successfully",
			"folder_id", newFolder.ID,
			"path", req.Path)

		// FileWatcherに追加
		if a.FileWatcher != nil {
			slog.Debug("AddFolder: Adding new folder to FileWatcher",
				"folder_id", newFolder.ID,
				"path", req.Path)
			if err := a.FileWatcher.AddFolder(&newFolder); err != nil {
				slog.Error("AddFolder: Failed to add folder to FileWatcher",
					"folder_id", newFolder.ID,
					"path", req.Path,
					"error", err.Error())
			} else {
				slog.Debug("AddFolder: Successfully added new folder to FileWatcher",
					"folder_id", newFolder.ID,
					"path", req.Path)
			}
		} else {
			slog.Warn("AddFolder: FileWatcher is nil, cannot add new folder")
		}

		response := dto.FolderResponse{
			ID:        newFolder.ID,
			Path:      newFolder.Path,
			IsWatched: newFolder.IsWatched,
			CreatedAt: newFolder.CreatedAt,
			UpdatedAt: newFolder.UpdatedAt,
		}

		slog.Info("AddFolder: Folder added successfully",
			"folder_id", newFolder.ID,
			"path", req.Path)
		ctx.JSON(http.StatusCreated, dto.FolderActionResponse{
			Success: true,
			Message: i18n.GetSuccessMessage(locale, "folder_added"),
			Data:    &response,
		})
	})
}

// RemoveFolder - 監視対象フォルダを削除（ソフトデリート）
// @Summary 監視対象フォルダを削除
// @Description フォルダを監視対象から削除します（ソフトデリート）
// @Tags Folders
// @Param id path int true "フォルダID"
// @Produce json
// @Success 200 {object} dto.FolderActionResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/folders/{id} [delete]
func (a *App) RemoveFolder(foldersGroup *gin.RouterGroup) {
	foldersGroup.DELETE("/:id", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		slog.Debug("RemoveFolder: Attempting to delete folder", "folder_id_str", idStr)

		id, err := strconv.Atoi(idStr)
		if err != nil {
			slog.Warn("RemoveFolder: Invalid folder ID format",
				"folder_id_str", idStr,
				"error", err.Error())
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_folder_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		slog.Debug("RemoveFolder: Converted folder ID", "folder_id", id)

		// フォルダを取得
		var folder entity.Folder
		if err := a.DB.Where("id = ?", id).First(&folder).Error; err != nil {
			slog.Warn("RemoveFolder: Folder not found",
				"folder_id", id,
				"error", err.Error())
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "folder_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		slog.Debug("RemoveFolder: Folder found, proceeding with soft delete",
			"folder_id", folder.ID,
			"path", folder.Path,
			"current_is_watched", folder.IsWatched)

		// ソフトデリート：is_watchedをfalseに
		if err := a.DB.Model(&folder).Update("is_watched", false).Error; err != nil {
			slog.Error("RemoveFolder: Failed to update is_watched flag",
				"folder_id", folder.ID,
				"path", folder.Path,
				"error", err.Error())
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_delete_folder"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		slog.Debug("RemoveFolder: Soft delete completed in database",
			"folder_id", folder.ID,
			"path", folder.Path)

		// FileWatcherから削除
		if a.FileWatcher != nil {
			if err := a.FileWatcher.RemoveFolder(folder.ID); err != nil {
				slog.Warn("RemoveFolder: Failed to remove folder from FileWatcher",
					"folder_id", folder.ID,
					"path", folder.Path,
					"error", err.Error())
			} else {
				slog.Debug("RemoveFolder: Folder removed from FileWatcher",
					"folder_id", folder.ID,
					"path", folder.Path)
			}
		} else {
			slog.Debug("RemoveFolder: FileWatcher not initialized, skipping removal")
		}

		response := dto.FolderResponse{
			ID:        folder.ID,
			Path:      folder.Path,
			IsWatched: false,
			CreatedAt: folder.CreatedAt,
			UpdatedAt: folder.UpdatedAt,
		}

		slog.Info("RemoveFolder: Folder removed successfully",
			"folder_id", folder.ID,
			"path", folder.Path)
		ctx.JSON(http.StatusOK, dto.FolderActionResponse{
			Success: true,
			Message: i18n.GetSuccessMessage(locale, "folder_removed"),
			Data:    &response,
		})
	})
}
