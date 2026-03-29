/**
 * クライアント設定管理ユーティリティ
 */

import type { DtoClientSettingsDTO } from '@/generated/models'
import { createDefaultSettings } from '@/types/settings'
import crypto from 'crypto'

const SETTINGS_STORAGE_KEY = 'client_settings'

/**
 * LocalStorage から設定を取得する
 */
export function getLocalStorageSettings(): DtoClientSettingsDTO {
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
export function setLocalStorageSettings(settings: DtoClientSettingsDTO): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

/**
 * 設定データの正規化（無効なフィールドを削除、不足分を補充）
 * すべてのフィールドが値を持つことを保証する
 */
export function getNormalizedLocalClientSettings(settings: DtoClientSettingsDTO): Required<DtoClientSettingsDTO> {
  const defaults = createDefaultSettings()
  // デフォルト値を基に、入力された値でマージする
  const normalized = { ...defaults, ...settings }
  return normalized as Required<DtoClientSettingsDTO>
}

/**
 * 設定データのハッシュを計算する（last_synced_at は除外）
 */
export function hashClientSettings(settings: DtoClientSettingsDTO): string {
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
