/**
 * クライアント設定の型定義
 */

export interface WatchedHistory {
  video_id: string
  updated_at: number
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
  }
}
