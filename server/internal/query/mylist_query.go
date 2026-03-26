package query

import (
	"gorm.io/gorm"

	"github.com/hogecode/commentPlayer/internal/entity"
)

// MylistQuery - マイリストに関するクエリを管理
type MylistQuery struct {
	DB *gorm.DB
}

// NewMylistQuery - MylistQueryを生成
func NewMylistQuery(db *gorm.DB) *MylistQuery {
	return &MylistQuery{DB: db}
}

// AddToMylist - マイリストに動画を追加
func (q *MylistQuery) AddToMylist(userID int, videoID int) (*entity.Mylist, error) {
	mylist := &entity.Mylist{
		UserID:  userID,
		VideoID: videoID,
	}

	result := q.DB.Create(mylist)
	if result.Error != nil {
		return nil, result.Error
	}

	return mylist, nil
}

// RemoveFromMylist - マイリストから動画を削除
func (q *MylistQuery) RemoveFromMylist(userID int, videoID int) error {
	result := q.DB.Where("user_id = ? AND video_id = ?", userID, videoID).Delete(&entity.Mylist{})
	if result.Error != nil {
		return result.Error
	}

	return nil
}

// GetMylist - ユーザーのマイリストを取得
func (q *MylistQuery) GetMylist(userID int, page int, limit int) ([]entity.Mylist, int64, error) {
	var mylists []entity.Mylist
	var total int64

	// 総数を取得
	result := q.DB.Where("user_id = ?", userID).Model(&entity.Mylist{}).Count(&total)
	if result.Error != nil {
		return nil, 0, result.Error
	}

	// ページネーション付きで取得
	offset := (page - 1) * limit
	result = q.DB.Where("user_id = ?", userID).
		Preload("Video").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&mylists)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return mylists, total, nil
}

// IsInMylist - 動画がマイリストに入っているかチェック
func (q *MylistQuery) IsInMylist(userID int, videoID int) (bool, error) {
	var count int64

	result := q.DB.Where("user_id = ? AND video_id = ?", userID, videoID).
		Model(&entity.Mylist{}).
		Count(&count)

	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}
