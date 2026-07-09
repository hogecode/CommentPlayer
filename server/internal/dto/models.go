package dto

import (
	"encoding/json"
	"time"
)

// ThumbnailInfo - サムネイル情報
type ThumbnailInfo struct {
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	GeneratedAt time.Time `json:"generated_at"`
}

// Video - ビデオモデル（DB依存を排除）
type Video struct {
	ID                 int             `json:"id"`
	FileName           string          `json:"file_name"`
	FolderID           int             `json:"folder_id"`
	SeriesID           *int            `json:"series_id"`
	Series             *Series         `json:"series,omitempty"`
	Episode            *int            `json:"episode"`
	Subtitle           *string         `json:"subtitle"`
	FilePath           string          `json:"-"`
	Description        *string         `json:"description"`
	Status             string          `json:"status"`
	FileHash           string          `json:"-"`
	FileSize           int64           `json:"file_size"`
	JikkyoCommentCount *int            `json:"jikkyo_comment_count"`
	JikkyoDate         *time.Time      `json:"jikkyo_date"`
	Views              int             `json:"views"`
	Liked              bool            `json:"liked"`
	ScreenshotFilePath *string         `json:"screenshot_file_path"`
	Duration           float64         `json:"duration"`
	ThumbnailInfoJSON  json.RawMessage `json:"-"`
	ThumbnailInfo      *ThumbnailInfo  `json:"thumbnail_info"`
	ChannelID          *int            `json:"channel_id"`
	ProgStartTime      *time.Time      `json:"prog_start_time"`
	ProgEndTime        *time.Time      `json:"prog_end_time"`
	IsDeleted          bool            `json:"is_deleted"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

// Capture - キャプチャモデル（DB依存を排除）
type Capture struct {
	ID               int       `json:"id"`
	Filename         string    `json:"filename"`
	VideoID          int       `json:"video_id"`
	SaveDir          string    `json:"_"`
	SavePath         string    `json:"_"`
	PlaybackPosition float64   `json:"playback_position"`
	CommentDelay     float64   `json:"comment_delay"`
	CreatedAt        time.Time `json:"created_at"`
}

// JSONMap - JSON型を表すカスタム型（map用）
type JSONMap map[string]interface{}

// JSONArray - JSON型を表すカスタム型（配列用）
type JSONArray []map[string]interface{}

// Series - シリーズモデル（DB依存を排除）
type Series struct {
	ID                  int       `json:"id"`
	SeriesNameFile      string    `json:"series_name_file"`
	SyobocalTitleID     *int      `json:"syobocal_title_id"`
	SyobocalTitleName   *string   `json:"syobocal_title_name"`
	SyobocalTitleNameEn *string   `json:"syobocal_title_name_en"`
	Comment             JSONMap   `json:"comment"`
	FirstYear           *int      `json:"first_year"`
	FirstMonth          *int      `json:"first_month"`
	FirstEndYear        *int      `json:"first_end_year"`
	FirstEndMonth       *int      `json:"first_end_month"`
	Subtitles           JSONArray `json:"subtitles"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// User - ユーザーモデル（DB依存を排除）
type User struct {
	ID                   int                    `json:"id"`
	Name                 string                 `json:"name"`
	Password             string                 `json:"-"`
	IsAdmin              int                    `json:"is_admin"`
	ClientSettingsJSON   json.RawMessage        `json:"-"`
	ClientSettings       map[string]interface{} `json:"client_settings"`
	NiconicoUserID       *int                   `json:"niconico_user_id"`
	NiconicoUserName     *string                `json:"niconico_user_name"`
	NiconicoUserPremium  *int                   `json:"niconico_user_premium"`
	NiconicoAccessToken  *string                `json:"-"`
	NiconicoRefreshToken *string                `json:"-"`
	CreatedAt            time.Time              `json:"created_at"`
	UpdatedAt            time.Time              `json:"updated_at"`
}

// Folder - フォルダモデル（DB依存を排除）
type Folder struct {
	ID        int       `json:"id"`
	Path      string    `json:"path"`
	IsWatched bool      `json:"is_watched"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
