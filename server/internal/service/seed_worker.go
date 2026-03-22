package service

import (
	"errors"
	"fmt"
	"log"

	"gorm.io/gorm"

	"github.com/hogecode/commentPlayer/internal/entity"
)

// SeedWorker - シードデータワーカー
type SeedWorker struct {
	db *gorm.DB
}

// NewSeedWorker - SeedWorkerを新規作成
func NewSeedWorker(db *gorm.DB) *SeedWorker {
	return &SeedWorker{
		db: db,
	}
}

// SeedData - シードデータの構造体
type SeedData struct {
	Folders []entity.Folder
	Videos  []entity.Video
	Captures []entity.Capture
	Users   []entity.User
}

// InsertSeedData - シードデータを挿入
// トランザクションを使用してデータ整合性を保証
func (sw *SeedWorker) InsertSeedData(data *SeedData) error {
	if data == nil {
		return errors.New("seed data is nil")
	}

	// トランザクションを開始
	tx := sw.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}

	// ロールバック用のデファー関数を設定
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic occurred during seed insertion, transaction rolled back: %v\n", r)
		}
	}()

	// Folderを挿入
	if len(data.Folders) > 0 {
		if err := sw.insertFolders(tx, data.Folders); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert folders: %w", err)
		}
		log.Printf("Inserted %d folders\n", len(data.Folders))
	}

	// Userを挿入
	if len(data.Users) > 0 {
		if err := sw.insertUsers(tx, data.Users); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert users: %w", err)
		}
		log.Printf("Inserted %d users\n", len(data.Users))
	}

	// Videoを挿入
	if len(data.Videos) > 0 {
		if err := sw.insertVideos(tx, data.Videos); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert videos: %w", err)
		}
		log.Printf("Inserted %d videos\n", len(data.Videos))
	}

	// Captureを挿入
	if len(data.Captures) > 0 {
		if err := sw.insertCaptures(tx, data.Captures); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert captures: %w", err)
		}
		log.Printf("Inserted %d captures\n", len(data.Captures))
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Println("Seed data inserted successfully")
	return nil
}

// DeleteAllSeedData - すべてのシードデータを削除
// トランザクションを使用してデータ整合性を保証
func (sw *SeedWorker) DeleteAllSeedData() error {
	// トランザクションを開始
	tx := sw.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}

	// ロールバック用のデファー関数を設定
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic occurred during seed deletion, transaction rolled back: %v\n", r)
		}
	}()

	// 削除順序は外部キー制約を考慮
	// Capture -> Video -> Folder の順に削除
	if err := tx.Exec("DELETE FROM capture").Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete captures: %w", err)
	}
	log.Println("Deleted all captures")

	if err := tx.Exec("DELETE FROM video").Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete videos: %w", err)
	}
	log.Println("Deleted all videos")

	if err := tx.Exec("DELETE FROM folder").Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete folders: %w", err)
	}
	log.Println("Deleted all folders")

	if err := tx.Exec("DELETE FROM users").Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete users: %w", err)
	}
	log.Println("Deleted all users")

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Println("Seed data deleted successfully")
	return nil
}

// DeleteSeedDataByID - IDでシードデータを削除
func (sw *SeedWorker) DeleteSeedDataByID(folderIDs []int, videoIDs []int, captureIDs []int, userIDs []int) error {
	if len(folderIDs) == 0 && len(videoIDs) == 0 && len(captureIDs) == 0 && len(userIDs) == 0 {
		return errors.New("no IDs provided for deletion")
	}

	// トランザクションを開始
	tx := sw.db.Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %w", tx.Error)
	}

	// ロールバック用のデファー関数を設定
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Printf("Panic occurred during seed deletion, transaction rolled back: %v\n", r)
		}
	}()

	// Captureを削除（削除順序は外部キー制約を考慮）
	if len(captureIDs) > 0 {
		if err := tx.Where("id IN ?", captureIDs).Delete(&entity.Capture{}).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to delete captures: %w", err)
		}
		log.Printf("Deleted %d captures\n", len(captureIDs))
	}

	// Videoを削除
	if len(videoIDs) > 0 {
		if err := tx.Where("id IN ?", videoIDs).Delete(&entity.Video{}).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to delete videos: %w", err)
		}
		log.Printf("Deleted %d videos\n", len(videoIDs))
	}

	// Folderを削除
	if len(folderIDs) > 0 {
		if err := tx.Where("id IN ?", folderIDs).Delete(&entity.Folder{}).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to delete folders: %w", err)
		}
		log.Printf("Deleted %d folders\n", len(folderIDs))
	}

	// Userを削除
	if len(userIDs) > 0 {
		if err := tx.Where("id IN ?", userIDs).Delete(&entity.User{}).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to delete users: %w", err)
		}
		log.Printf("Deleted %d users\n", len(userIDs))
	}

	// トランザクションをコミット
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Println("Seed data deleted successfully")
	return nil
}

// insertFolders - Folderエンティティをバッチ挿入（パフォーマンス最適化）
func (sw *SeedWorker) insertFolders(tx *gorm.DB, folders []entity.Folder) error {
	const batchSize = 100
	for i := 0; i < len(folders); i += batchSize {
		end := i + batchSize
		if end > len(folders) {
			end = len(folders)
		}

		batch := folders[i:end]
		if err := tx.CreateInBatches(batch, batchSize).Error; err != nil {
			return err
		}
	}
	return nil
}

// insertUsers - Userエンティティをバッチ挿入（パフォーマンス最適化）
func (sw *SeedWorker) insertUsers(tx *gorm.DB, users []entity.User) error {
	const batchSize = 100
	for i := 0; i < len(users); i += batchSize {
		end := i + batchSize
		if end > len(users) {
			end = len(users)
		}

		batch := users[i:end]
		if err := tx.CreateInBatches(batch, batchSize).Error; err != nil {
			return err
		}
	}
	return nil
}

// insertVideos - Videoエンティティをバッチ挿入（パフォーマンス最適化）
func (sw *SeedWorker) insertVideos(tx *gorm.DB, videos []entity.Video) error {
	const batchSize = 100
	for i := 0; i < len(videos); i += batchSize {
		end := i + batchSize
		if end > len(videos) {
			end = len(videos)
		}

		batch := videos[i:end]
		if err := tx.CreateInBatches(batch, batchSize).Error; err != nil {
			return err
		}
	}
	return nil
}

// insertCaptures - Captureエンティティをバッチ挿入（パフォーマンス最適化）
func (sw *SeedWorker) insertCaptures(tx *gorm.DB, captures []entity.Capture) error {
	const batchSize = 100
	for i := 0; i < len(captures); i += batchSize {
		end := i + batchSize
		if end > len(captures) {
			end = len(captures)
		}

		batch := captures[i:end]
		if err := tx.CreateInBatches(batch, batchSize).Error; err != nil {
			return err
		}
	}
	return nil
}

// GetDefaultSeedData - デフォルトのシードデータを取得
func GetDefaultSeedData() *SeedData {
	return &SeedData{
		Folders: getDefaultFolders(),
		Users:   getDefaultUsers(),
		Videos:  getDefaultVideos(),
		Captures: getDefaultCaptures(),
	}
}

// getDefaultFolders - デフォルトのFolderシードデータ
func getDefaultFolders() []entity.Folder {
	return []entity.Folder{
		{
			Path:      "./videos/sample1",
			IsWatched: true,
		},
		{
			Path:      "./videos/sample2",
			IsWatched: true,
		},
	}
}

// getDefaultUsers - デフォルトのUserシードデータ
func getDefaultUsers() []entity.User {
	return []entity.User{
		{
			Name:     "admin",
			Password: "$2a$10$dummy_hash_for_admin", // bcrypt hash (dummy)
			IsAdmin:  1,
		},
		{
			Name:     "user",
			Password: "$2a$10$dummy_hash_for_user", // bcrypt hash (dummy)
			IsAdmin:  0,
		},
	}
}

// getDefaultVideos - デフォルトのVideoシードデータ
func getDefaultVideos() []entity.Video {
	views := 100
	count := 5
	
	return []entity.Video{
		{
			FileName:          "sample_video_1.mp4",
			FolderID:          1,
			FilePath:          "./videos/sample1/sample_video_1.mp4",
			FileHash:          "hash_001",
			FileSize:          1024000,
			JikkyoCommentCount: &count,
			Views:             views,
			Liked:             false,
			Duration:          60.5,
			IsDeleted:         false,
			Status:            "ready",
		},
		{
			FileName:          "sample_video_2.mp4",
			FolderID:          2,
			FilePath:          "./videos/sample2/sample_video_2.mp4",
			FileHash:          "hash_002",
			FileSize:          2048000,
			JikkyoCommentCount: &count,
			Views:             views,
			Liked:             false,
			Duration:          120.5,
			IsDeleted:         false,
			Status:            "ready",
		},
	}
}

// getDefaultCaptures - デフォルトのCaptureシードデータ
func getDefaultCaptures() []entity.Capture {
	return []entity.Capture{
		{
			Filename: "capture_001.png",
			VideoID:  1,
		},
		{
			Filename: "capture_002.png",
			VideoID:  1,
		},
		{
			Filename: "capture_003.png",
			VideoID:  2,
		},
	}
}
