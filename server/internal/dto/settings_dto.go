package dto

import (
	"encoding/json"
)

// MylistItem - マイリスト情報
type MylistItem struct {
	ID        int   `json:"id"`
	CreatedAt int64 `json:"created_at"` // Unix timestamp (ms)
}

// WatchedHistoryItem - 動画視聴履歴
type WatchedHistoryItem struct {
	VideoID              int   `json:"video_id"`
	LastPlaybackPosition float64   `json:"last_playback_position"` // ミリ秒
	JikkyoCommentOffset  int   `json:"jikkyo_comment_offset"`
	CreatedAt            int64 `json:"created_at"`
	UpdatedAt            int64 `json:"updated_at"`
}

// MutedCommentKeyword - ミュートキーワード
type MutedCommentKeyword struct {
	Pattern string `json:"pattern"`
	Match   string `json:"match"` // partial, forward, backward, exact, regex
}

// ClientSettingsDTO - クライアント設定（JSON/APIリクエスト・レスポンス用）
type ClientSettingsDTO struct {
	// 動画履歴
	VideoWatchedHistoryMaxCount int `json:"video_watched_history_max_count"`

	// 設定の同期
	SyncSettings bool  `json:"sync_settings"`
	LastSyncedAt int64 `json:"last_synced_at"` // Unix timestamp (ms)

	// コメント設定
	CommentSpeedRate             float64 `json:"comment_speed_rate"`
	CommentFontSize              int     `json:"comment_font_size"`
	CloseCommentFormAfterSending bool    `json:"close_comment_form_after_sending"`
	MaxCommentsDisplayCount      int     `json:"max_comments_display_count"`
	DefaultCommentColor          string  `json:"default_comment_color"`

	// コメントNG設定
	MuteFixedComments                               bool                     `json:"mute_fixed_comments"`
	MuteColoredComments                             bool                     `json:"mute_colored_comments"`
	MuteBigSizeComments                             bool                     `json:"mute_big_size_comments"`
	MuteVulgarComments                              bool                     `json:"mute_vulgar_comments"`
	MuteAbusiveDiscriminatoryPrejudicedComments     bool                     `json:"mute_abusive_discriminatory_prejudiced_comments"`
	MuteConsecutiveSameCharactersComments           bool                     `json:"mute_consecutive_same_characters_comments"`
	MutedCommentKeywords                            []MutedCommentKeyword    `json:"muted_comment_keywords"`
	MutedNiconicoUserIds                            []string                 `json:"muted_niconico_user_ids"`
	MuteCommentKeywordsNormalizeAlphanumericWidthCase bool                    `json:"mute_comment_keywords_normalize_alphanumeric_width_case"`

	// マイリスト情報
	Mylist []MylistItem `json:"mylist"`

	// 動画視聴履歴
	WatchedHistory []WatchedHistoryItem `json:"watched_history"`
}

// ToMap - ClientSettingsDTOをMap形式に変換
func (c *ClientSettingsDTO) ToMap() map[string]interface{} {
	data, _ := json.Marshal(c)
	var result map[string]interface{}
	json.Unmarshal(data, &result)
	return result
}
