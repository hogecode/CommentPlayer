package query

import (
	"github.com/hogecode/commentPlayer/internal/entity"
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
func (q *VideoQuery) GetVideoList(ids []int, filterBy string, year, page, limit int, sort, order string) ([]entity.Video, int64, error) {
	query := q.db.Preload("Series")

	// is_deletedフラグでフィルター
	query = query.Where("is_deleted = 0")

	// IDs でフィルター
	if len(ids) > 0 {
		query = query.Where("id IN ?", ids)
	}

	// FilterBy でフィルター
	if filterBy != "" {
		query = query.Where("status = ?", filterBy)
	}

	// Year でフィルター（年が指定されている場合）
	// GetVideoYearsと同様にjikkyo_date IS NOT NULLでフィルタしてからキャスト
	if year > 0 {
		query = query.Where("jikkyo_date IS NOT NULL AND CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) = ?", year)
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
// 検索対象: file_name, description, Series.SyobocalTitleName, subtitle
func (q *VideoQuery) SearchVideos(q_str string, page, limit int, order, filterBy string) ([]entity.Video, int64, error) {
	searchParam := "%" + q_str + "%"
	
	// LEFT JOINでSeriesを結合し、複数カラムで検索
	query := q.db.Preload("Series").
		Joins("LEFT JOIN series ON video.series_id = series.id").
		Where("video.file_name LIKE ? OR video.description LIKE ? OR series.syobocal_title_name LIKE ? OR video.subtitle LIKE ?",
			searchParam, searchParam, searchParam, searchParam)

	// FilterBy でフィルター
	if filterBy != "" {
		query = query.Where("video.status = ?", filterBy)
	}

	// 合計数を取得
	var total int64
	if err := query.Model(&entity.Video{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// ソート
	query = query.Order("video.jikkyo_date " + order)

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

// GetVideoYears - ビデオの年一覧を取得（jikkyo_dateから年を抽出してソート）
func (q *VideoQuery) GetVideoYears() ([]int, error) {
	var years []*int
	// 生のSQLで実行：NULLになる可能性があるので *int で受け取る
err := q.db.Raw(
	"SELECT DISTINCT CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) as year " +
		"FROM video " +
		"WHERE is_deleted = 0 " +
		"AND jikkyo_date IS NOT NULL " +
		"ORDER BY year DESC",
).Scan(&years).Error

	if err != nil {
		return nil, err
	}

	// ポインタをint値に変換（nullチェック込み）
	result := make([]int, 0, len(years))
	for _, year := range years {
		if year != nil {
			result = append(result, *year)
		}
	}
	return result, nil
}

// GetVideoByID - IDでビデオを取得
func (q *VideoQuery) GetVideoByID(id int) (*entity.Video, error) {
	var video entity.Video
	if err := q.db.Preload("Series").First(&video, id).Error; err != nil {
		return nil, err
	}
	return &video, nil
}
