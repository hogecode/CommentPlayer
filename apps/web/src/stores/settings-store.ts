/**
 * Zustand を使用した設定ストア
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClientSettings, createDefaultSettings } from '@/types/settings'
import { getNormalizedLocalClientSettings } from '@/lib/settings'

interface SettingsStoreState {
  settings: ClientSettings
  initializeSettings: () => void
  updateSettings: (updates: Partial<ClientSettings>) => void
}

const SETTINGS_STORAGE_KEY = 'client_settings'

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      settings: createDefaultSettings(),

      /**
       * 設定を初期化する（LocalStorage から読み込む）
       */
      initializeSettings: () => {
        set((state) => {
          const normalized = getNormalizedLocalClientSettings(state.settings)
          return { settings: normalized }
        })
      },

      /**
       * 設定を更新する
       * persist ミドルウェアにより自動的にローカルストレージに保存されます
       */
      updateSettings: (updates: Partial<ClientSettings>) => {
        set((state) => {
          const newSettings = {
            ...state.settings,
            ...updates,
          }
          console.log('Settings updated:', newSettings)
          return { settings: newSettings }
        })
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY, // LocalStorage のキー名
    }
  )
)
