/**
 * クライアント設定管理ユーティリティ
 */

import { ClientSettings, createDefaultSettings } from '@/types/settings'
import crypto from 'crypto'

const SETTINGS_STORAGE_KEY = 'client_settings'

/**
 * LocalStorage から設定を取得する
 */
export function getLocalStorageSettings(): ClientSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to parse settings from localStorage:', error)
  }
  return createDefaultSettings()
}

/**
 * LocalStorage に設定を保存する
 */
export function setLocalStorageSettings(settings: ClientSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

/**
 * 設定データの正規化（無効なフィールドを削除、不足分を補充）
 */
export function getNormalizedLocalClientSettings(settings: ClientSettings): ClientSettings {
  const defaults = createDefaultSettings()
  // デフォルト値を基に、入力された値でマージする
  const normalized = { ...defaults, ...settings }

  // video_watched_history_max_count が数値であることを確認
  if (!Number.isFinite(normalized.video_watched_history_max_count)) {
    normalized.video_watched_history_max_count = defaults.video_watched_history_max_count
  }

  // sync_settings がブール値であることを確認
  if (typeof normalized.sync_settings !== 'boolean') {
    normalized.sync_settings = defaults.sync_settings
  }

  // last_synced_at が数値であることを確認
  if (!Number.isFinite(normalized.last_synced_at)) {
    normalized.last_synced_at = defaults.last_synced_at
  }

  // comment_speed_rate が数値であることを確認
  if (!Number.isFinite(normalized.comment_speed_rate)) {
    normalized.comment_speed_rate = defaults.comment_speed_rate
  }

  // comment_font_size が数値であることを確認
  if (!Number.isFinite(normalized.comment_font_size)) {
    normalized.comment_font_size = defaults.comment_font_size
  }

  // close_comment_form_after_sending がブール値であることを確認
  if (typeof normalized.close_comment_form_after_sending !== 'boolean') {
    normalized.close_comment_form_after_sending = defaults.close_comment_form_after_sending
  }

  // max_comments_display_count が数値であることを確認
  if (!Number.isFinite(normalized.max_comments_display_count)) {
    normalized.max_comments_display_count = defaults.max_comments_display_count
  }

  // default_comment_color が文字列であることを確認
  if (typeof normalized.default_comment_color !== 'string' || !normalized.default_comment_color.startsWith('#')) {
    normalized.default_comment_color = defaults.default_comment_color
  }

  // NG設定のバリデーション
  if (typeof normalized.mute_fixed_comments !== 'boolean') {
    normalized.mute_fixed_comments = defaults.mute_fixed_comments
  }

  if (typeof normalized.mute_colored_comments !== 'boolean') {
    normalized.mute_colored_comments = defaults.mute_colored_comments
  }

  if (typeof normalized.mute_big_size_comments !== 'boolean') {
    normalized.mute_big_size_comments = defaults.mute_big_size_comments
  }

  if (typeof normalized.mute_vulgar_comments !== 'boolean') {
    normalized.mute_vulgar_comments = defaults.mute_vulgar_comments
  }

  if (typeof normalized.mute_abusive_discriminatory_prejudiced_comments !== 'boolean') {
    normalized.mute_abusive_discriminatory_prejudiced_comments = defaults.mute_abusive_discriminatory_prejudiced_comments
  }

  if (typeof normalized.mute_consecutive_same_characters_comments !== 'boolean') {
    normalized.mute_consecutive_same_characters_comments = defaults.mute_consecutive_same_characters_comments
  }

  if (!Array.isArray(normalized.muted_comment_keywords)) {
    normalized.muted_comment_keywords = defaults.muted_comment_keywords
  }

  if (!Array.isArray(normalized.muted_niconico_user_ids)) {
    normalized.muted_niconico_user_ids = defaults.muted_niconico_user_ids
  }

  if (typeof normalized.mute_comment_keywords_normalize_alphanumeric_width_case !== 'boolean') {
    normalized.mute_comment_keywords_normalize_alphanumeric_width_case = defaults.mute_comment_keywords_normalize_alphanumeric_width_case
  }

  console.log('Normalized settings:', normalized)
  return normalized
}

/**
 * 設定データのハッシュを計算する（last_synced_at は除外）
 */
export function hashClientSettings(settings: ClientSettings): string {
  // last_synced_at を除外したコピーを作成
  const settingsForHash = { ...settings }
  delete (settingsForHash as any).last_synced_at

  // JSON 文字列化してハッシュ化
  const settingsString = JSON.stringify(settingsForHash)
  
  // 簡易的なハッシュ関数（実際にはより堅牢なハッシュ関数を使用すること）
  let hash = 0
  for (let i = 0; i < settingsString.length; i++) {
    const char = settingsString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

/**
 * 2つのオブジェクトの差分を取得する
 */
export function diff(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
  const differences: Record<string, any> = {}

  for (const key in obj2) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      differences[key] = {
        from: obj1[key],
        to: obj2[key],
      }
    }
  }

  return differences
}
