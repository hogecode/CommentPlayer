/**
 * クライアント設定の型定義
 */

export interface WatchedHistory {
  video_id: string
  updated_at: number
}

export interface MutedCommentKeyword {
  pattern: string
  match: 'partial' | 'forward' | 'backward' | 'exact' | 'regex'
}

export interface ClientSettings {
  // ビデオ視聴履歴
  watched_history: WatchedHistory[]
  video_watched_history_max_count: number

  // 設定の同期
  sync_settings: boolean
  last_synced_at: number

  // コメント（弾幕）設定
  comment_speed_rate: number // コメントの流れる速度（倍率）
  comment_font_size: number // コメントのフォントサイズ（ピクセル）
  close_comment_form_after_sending: boolean // コメント送信後にフォームを閉じるか

  // コメントNG設定
  mute_fixed_comments: boolean // 上下固定コメントをミュート
  mute_colored_comments: boolean // 色付きコメントをミュート
  mute_big_size_comments: boolean // 大きいサイズのコメントをミュート
  mute_vulgar_comments: boolean // 露骨な表現を含むコメントをミュート
  mute_abusive_discriminatory_prejudiced_comments: boolean // 差別的・政治的表現をミュート
  mute_consecutive_same_characters_comments: boolean // 連続同一文字をミュート
  muted_comment_keywords: MutedCommentKeyword[] // ミュートキーワード
  muted_niconico_user_ids: string[] // ミュートユーザーID
  mute_comment_keywords_normalize_alphanumeric_width_case: boolean // キーワード正規化

  // その他の設定
  [key: string]: unknown
}

/**
 * デフォルト設定を作成する
 */
export function createDefaultSettings(): ClientSettings {
  return {
    watched_history: [],
    video_watched_history_max_count: 100,
    sync_settings: true,
    last_synced_at: 0,
    comment_speed_rate: 1,
    comment_font_size: 25,
    close_comment_form_after_sending: true,
    mute_fixed_comments: false,
    mute_colored_comments: false,
    mute_big_size_comments: false,
    mute_vulgar_comments: false,
    mute_abusive_discriminatory_prejudiced_comments: false,
    mute_consecutive_same_characters_comments: false,
    muted_comment_keywords: [],
    muted_niconico_user_ids: [],
    mute_comment_keywords_normalize_alphanumeric_width_case: false,
  }
}
