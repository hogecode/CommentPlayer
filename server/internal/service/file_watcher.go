package service

import (
	"fmt"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"time"

	"github.com/fsnotify/fsnotify"
	"gorm.io/gorm"

	"github.com/hogecode/commentPlayer/internal/entity"
)

// FileWatcher - ファイルウォッチャーサービス
type FileWatcher struct {
	db                  *gorm.DB
	watchPaths          map[int]string // FolderID -> Path
	watcher             *fsnotify.Watcher
	done                chan bool
	screenshotOutputDir string
}

// NewFileWatcher - FileWatcherを新規作成
func NewFileWatcher(db *gorm.DB, screenshotOutputDir string) (*FileWatcher, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create watcher: %w", err)
	}

	return &FileWatcher{
		db:                  db,
		watchPaths:          make(map[int]string),
		watcher:             watcher,
		done:                make(chan bool),
		screenshotOutputDir: screenshotOutputDir,
	}, nil
}

// AddFolder - 監視対象のフォルダを追加
func (fw *FileWatcher) AddFolder(folder *entity.Folder) error {

	slog.Debug("AddFolder: Adding folder to watch",
		"folder_id", folder.ID,
		"path", folder.Path)
		
	// フォルダの存在確認
	if _, err := os.Stat(folder.Path); err != nil {
		return fmt.Errorf("folder does not exist: %s", folder.Path)
	}

	if err := fw.watcher.Add(folder.Path); err != nil {
		return fmt.Errorf("failed to add watch path: %w", err)
	}

	fw.watchPaths[folder.ID] = folder.Path
	log.Printf("Started watching folder: %s (ID: %d)\n", folder.Path, folder.ID)

	// フォルダ内の既存ファイルを処理
	slog.Debug("AddFolder: Processing existing files in folder",
		"folder_id", folder.ID,
		"path", folder.Path)
	fw.processExistingFiles(folder)
	slog.Debug("AddFolder: Finished processing existing files",
		"folder_id", folder.ID,
		"path", folder.Path)

	return nil
}

// RemoveFolder - 監視対象のフォルダを削除
func (fw *FileWatcher) RemoveFolder(folderID int) error {
	path, exists := fw.watchPaths[folderID]
	if !exists {
		return fmt.Errorf("folder not being watched: %d", folderID)
	}

	if err := fw.watcher.Remove(path); err != nil {
		return fmt.Errorf("failed to remove watch path: %w", err)
	}

	delete(fw.watchPaths, folderID)
	log.Printf("Stopped watching folder: %s (ID: %d)\n", path, folderID)

	// フォルダに属するビデオをマーク削除
	slog.Debug("RemoveFolder: Marking videos as deleted for folder",
		"folder_id", folderID,
		"path", path)
	if err := fw.db.Model(&entity.Video{}).
		Where("folder_id = ?", folderID).
		Update("is_deleted", true).Error; err != nil {
		slog.Error("RemoveFolder: Failed to mark videos as deleted",
			"folder_id", folderID,
			"path", path,
			"error", err.Error())
		return fmt.Errorf("failed to mark videos as deleted: %w", err)
	}
	slog.Debug("RemoveFolder: Successfully marked videos as deleted",
		"folder_id", folderID,
		"path", path)

	return nil
}

// Start - ファイルウォッチャーを開始（goroutineで実行）
func (fw *FileWatcher) Start() {
	go fw.watch()
}

// Stop - ファイルウォッチャーを停止
func (fw *FileWatcher) Stop() error {
	fw.done <- true
	return fw.watcher.Close()
}

// watch - ファイルイベントを監視
func (fw *FileWatcher) watch() {
	for {
		select {
		case event, ok := <-fw.watcher.Events:
			if !ok {
				return
			}

			// イベント処理
			fw.handleFileEvent(event)

		case err, ok := <-fw.watcher.Errors:
			if !ok {
				return
			}
			log.Printf("Watcher error: %v\n", err)

		case <-fw.done:
			return
		}
	}
}

// handleFileEvent - ファイルイベントを処理
func (fw *FileWatcher) handleFileEvent(event fsnotify.Event) {
	fileName := filepath.Base(event.Name)

	// コメントファイルのみの追加/削除は無視
	if IsCommentFile(fileName) && event.Op == fsnotify.Create {
		return
	}

	// 動画ファイルの場合のみ処理
	if !IsVideoFile(fileName) {
		return
	}

	// フォルダIDを取得
	folderID := fw.getFolderIDByPath(filepath.Dir(event.Name))
	if folderID == 0 {
		return
	}

	switch {
	case event.Op&fsnotify.Create == fsnotify.Create:
		fw.handleVideoFileCreated(event.Name, folderID)
	case event.Op&fsnotify.Remove == fsnotify.Remove:
		fw.handleVideoFileDeleted(event.Name, folderID)
	}
}

// handleVideoFileCreated - 動画ファイル作成時の処理
func (fw *FileWatcher) handleVideoFileCreated(filePath string, folderID int) {
	fileName := filepath.Base(filePath)

	// DBに既存レコードがあるか確認
	var video entity.Video
	result := fw.db.Where("file_name = ? AND folder_id = ?", fileName, folderID).First(&video)

	if result.Error == gorm.ErrRecordNotFound {
		// 新規レコードを作成
		fw.createVideoRecord(filePath, folderID)
	} else if result.Error == nil && video.IsDeleted {
		// 削除済みレコードの復旧
		fw.restoreVideoRecord(&video)
	}
}

// handleVideoFileDeleted - 動画ファイル削除時の処理
func (fw *FileWatcher) handleVideoFileDeleted(filePath string, folderID int) {
	fileName := filepath.Base(filePath)

	// DBのレコードをマーク削除
	fw.db.Model(&entity.Video{}).
		Where("file_name = ? AND folder_id = ?", fileName, folderID).
		Update("is_deleted", true)

	log.Printf("Marked video as deleted: %s\n", fileName)
}

// createVideoRecord - ビデオレコードを作成
func (fw *FileWatcher) createVideoRecord(filePath string, folderID int) {
	fileName := filepath.Base(filePath)

	// ビデオメタデータを抽出
	metadata, err := ExtractVideoMetadata(filePath, fw.screenshotOutputDir)
	if err != nil {
		log.Printf("Error extracting video metadata: %v\n", err)
		return
	}

	// コメントファイル情報を取得
	commentData := fw.getCommentData(filePath)

	// ビデオレコードを作成
	video := entity.Video{
		FileName:           fileName,
		FolderID:           folderID,
		FilePath:           filePath,
		FileHash:           metadata.FileHash,
		FileSize:           metadata.FileSize,
		Duration:           metadata.Duration,
		ScreenshotFilePath: metadata.ScreenshotFilePath,
		JikkyoCommentCount: &commentData.Count,
		JikkyoDate:         fw.commentTimeToPointer(commentData.NewestDate),
		Views:              0,
		Liked:              false,
		IsDeleted:          false,
		Status:             "ready",
	}

	if err := fw.db.Create(&video).Error; err != nil {
		log.Printf("Error creating video record: %v\n", err)
		return
	}

	log.Printf("Created video record: %s\n", fileName)
}

// restoreVideoRecord - 削除済みビデオレコードを復旧
func (fw *FileWatcher) restoreVideoRecord(video *entity.Video) {
	if err := fw.db.Model(video).Update("is_deleted", false).Error; err != nil {
		log.Printf("Error restoring video record: %v\n", err)
		return
	}
	log.Printf("Restored video record: %s\n", video.FileName)
}

// getCommentData - コメントファイル情報を取得
func (fw *FileWatcher) getCommentData(videoFilePath string) *CommentData {
	baseFileName := GetBaseFileName(filepath.Base(videoFilePath))
	folderPath := filepath.Dir(videoFilePath)

	// XMLまたはJSONのコメントファイルを探す
	commentExtensions := []string{".xml", ".json"}
	for _, ext := range commentExtensions {
		commentPath := filepath.Join(folderPath, baseFileName+ext)
		if _, err := os.Stat(commentPath); err == nil {
			commentData, err := ParseCommentFile(commentPath)
			if err == nil && commentData != nil {
				return commentData
			}
		}
	}

	return &CommentData{Count: 0}
}

// getFolderIDByPath - パスからフォルダIDを取得
func (fw *FileWatcher) getFolderIDByPath(path string) int {
	for folderID, watchPath := range fw.watchPaths {
		if watchPath == path {
			return folderID
		}
	}
	return 0
}

// commentTimeToPointer - time.Timeをポインタに変換
func (fw *FileWatcher) commentTimeToPointer(t time.Time) *time.Time {
	if t.IsZero() {
		return nil
	}
	return &t
}

// SyncFoldersWithDB - DBの監視対象フォルダをロードして同期
func (fw *FileWatcher) SyncFoldersWithDB() error {
	var folders []entity.Folder

	// DB内の監視対象フォルダをすべて取得
	if err := fw.db.Where("is_watched = ?", true).Find(&folders).Error; err != nil {
		return fmt.Errorf("failed to fetch folders: %w", err)
	}

	// 各フォルダを監視開始
	for _, folder := range folders {
		if err := fw.AddFolder(&folder); err != nil {
			log.Printf("Error adding folder to watch: %v\n", err)
			// エラーがあっても他のフォルダの処理は継続
		}

		// フォルダ内の既存ファイルを処理
		fw.processExistingFiles(&folder)
	}

	// 削除されたフォルダの処理
	fw.markDeletedFoldersVideos()

	return nil
}

// processExistingFiles - フォルダ内の既存ファイルを処理
func (fw *FileWatcher) processExistingFiles(folder *entity.Folder) {
	files, err := os.ReadDir(folder.Path)
	if err != nil {
		log.Printf("Error reading folder: %v\n", err)
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		fileName := file.Name()
		if !IsVideoFile(fileName) {
			continue
		}

		filePath := filepath.Join(folder.Path, fileName)

		// DBに既存レコードがあるか確認
		var count int64
		fw.db.Model(&entity.Video{}).
			Where("file_name = ? AND folder_id = ?", fileName, folder.ID).
			Count(&count)

		if count == 0 {
			// 新規レコードを作成
			fw.createVideoRecord(filePath, folder.ID)
		} else {
			// 既存レコードを復旧（削除済みの場合）
			var video entity.Video
			fw.db.Where("file_name = ? AND folder_id = ?", fileName, folder.ID).First(&video)
			if video.IsDeleted {
				fw.db.Model(&video).Update("is_deleted", false)
			}
		}
	}
}

// markDeletedFoldersVideos - 削除されたフォルダのビデオをマーク削除
func (fw *FileWatcher) markDeletedFoldersVideos() {
	var folders []entity.Folder
	if err := fw.db.Where("is_watched = ?", true).Find(&folders).Error; err != nil {
		return
	}

	watchedPaths := make(map[string]bool)
	for _, folder := range folders {
		watchedPaths[folder.Path] = true
	}

	// DB内のすべてのビデオを取得
	var videos []entity.Video
	if err := fw.db.Where("is_deleted = ?", false).Find(&videos).Error; err != nil {
		return
	}

	// 監視対象外のフォルダのビデオをマーク削除
	for _, video := range videos {
		if !watchedPaths[filepath.Dir(video.FilePath)] {
			fw.db.Model(&video).Update("is_deleted", true)
		}
	}
}
