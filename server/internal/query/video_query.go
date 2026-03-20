package query

import (
	"github.com/hogecode/CommentVideo/internal/entity"
	"gorm.io/gorm"
)

// VideoListRequestInterface - ビデオリストリクエストインターフェース
type VideoListRequestInterface interface {
	GetIDs() []int
	GetFilterBy() string
	GetPage() int
	GetLimit() int
	GetSort() string
	GetOrder() string
}

// VideoSearchRequestInterface - ビデオ検索リクエストインターフェース
type VideoSearchRequestInterface interface {
	GetQ() string
	GetPage() int
	GetLimit() int
	GetOrder() string
	GetFilterBy() string
}

// VideoQuery - ビデオ関連のクエリ
type VideoQuery struct {
	db *gorm.DB
}

// NewVideoQuery - VideoQuery を初期化
func NewVideoQuery(db *gorm.DB) *VideoQuery {
	return &VideoQuery{db: db}
}

// GetVideoList - ビデオ一覧を取得（任意の互換リクエスト型を受け入れる）
func (q *VideoQuery) GetVideoList(ids []int, filterBy string, page, limit int, sort, order string) ([]entity.Video, int64, error) {
	query := q.db

	// IDs でフィルター
	if len(ids) > 0 {
		query = query.Where("id IN ?", ids)
	}

	// FilterBy でフィルター
	if filterBy != "" {
		query = query.Where("status = ?", filterBy)
	}

	// 合計数を取得
	var total int64
	if err := query.Model(&entity.Video{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// ソート
	query = query.Order(sort + " " + order)

	// ページネーション
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// データ取得
	var videos []entity.Video
	if err := query.Find(&videos).Error; err != nil {
		return nil, 0, err
	}

	return videos, total, nil
}

// SearchVideos - ビデオを検索
func (q *VideoQuery) SearchVideos(q_str string, page, limit int, order, filterBy string) ([]entity.Video, int64, error) {
	query := q.db.Where("file_name LIKE ? OR description LIKE ?", "%"+q_str+"%", "%"+q_str+"%")

	// FilterBy でフィルター
	if filterBy != "" {
		query = query.Where("status = ?", filterBy)
	}

	// 合計数を取得
	var total int64
	if err := query.Model(&entity.Video{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// ソート
	query = query.Order("created_at " + order)

	// ページネーション
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	// データ取得
	var videos []entity.Video
	if err := query.Find(&videos).Error; err != nil {
		return nil, 0, err
	}

	return videos, total, nil
}

// GetVideoByID - IDでビデオを取得
func (q *VideoQuery) GetVideoByID(id int) (*entity.Video, error) {
	var video entity.Video
	if err := q.db.First(&video, id).Error; err != nil {
		return nil, err
	}
	return &video, nil
}
