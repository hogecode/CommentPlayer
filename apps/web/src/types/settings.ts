/**
 * クライアント設定の型定義
 * サーバー側で定義された自動生成型を再エクスポート
 */

export type {
  DtoClientSettingsDTO,
  DtoMutedCommentKeyword,
  DtoMylistItem,
  DtoWatchedHistoryItem,
} from '@/generated/models'

import type { DtoClientSettingsDTO } from '@/generated/models'

/**
 * デフォルト設定を作成する
 */
export function createDefaultSettings(): Required<DtoClientSettingsDTO> {
  return {
    video_watched_history_max_count: 100,
    sync_settings: true,
    last_synced_at: 0,
    comment_speed_rate: 1,
    comment_font_size: 25,
    close_comment_form_after_sending: true,
    max_comments_display_count: 5000,
    default_comment_color: '#ffffff',
    mute_fixed_comments: false,
    mute_colored_comments: false,
    mute_big_size_comments: false,
    mute_vulgar_comments: false,
    mute_abusive_discriminatory_prejudiced_comments: false,
    mute_consecutive_same_characters_comments: false,
    muted_comment_keywords: [],
    muted_niconico_user_ids: [],
    mute_comment_keywords_normalize_alphanumeric_width_case: false,
    mylist: [],
    watched_history: [],
  }
}
