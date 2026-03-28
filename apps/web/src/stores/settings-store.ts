/**
 * Zustand を使用した設定ストア
 */

import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'
import { ClientSettings, createDefaultSettings } from '@/types/settings'
import { getNormalizedLocalClientSettings } from '@/lib/settings'

interface SettingsStoreState {
  settings: ClientSettings
  initializeSettings: () => void
  updateSettings: (updates: Partial<ClientSettings>) => void
  syncClientSettingsToServer: () => Promise<void>
  syncClientSettingsFromServer: () => Promise<void>
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

      /**
       * クライアント設定をサーバーに同期する
       * TODO: サーバーAPIの実装が完了したら実装する
       */
      syncClientSettingsToServer: async () => {

        try {
          const { settings } = get()
          // TODO: サーバーAPIエンドポイントを実装してここで呼び出す
          // const response = await fetch('/api/settings', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'Authorization': `Bearer ${token}`,
          //   },
          //   body: JSON.stringify(settings),
          // })
          // if (!response.ok) {
          //   throw new Error(`Failed to sync settings to server: ${response.statusText}`)
          // }

          // Update last_synced_at
          set((state) => ({
            settings: {
              ...state.settings,
              last_synced_at: Date.now(),
            },
          }))

          console.log('Settings synced to server successfully')
        } catch (error) {
          console.error('Error syncing settings to server:', error)
        }
      },

      /**
       * サーバーの設定をこのクライアントに同期する
       * TODO: サーバーAPIの実装が完了したら実装する
       */
      syncClientSettingsFromServer: async () => {

        try {
          // TODO: サーバーAPIエンドポイントを実装してここで呼び出す
          // const response = await fetch('/api/settings', {
          //   method: 'GET',
          //   headers: {
          //     'Authorization': `Bearer ${token}`,
          //   },
          // })
          // if (!response.ok) {
          //   throw new Error(`Failed to fetch settings from server: ${response.statusText}`)
          // }
          // const serverSettings = await response.json() as ClientSettings
          // const normalized = getNormalizedLocalClientSettings(serverSettings)
          // set({ settings: normalized })

          console.log('Settings synced from server successfully')
        } catch (error) {
          console.error('Error syncing settings from server:', error)
        }
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY, // LocalStorage のキー名
      // 古い形式のデータとの互換性を持たせる
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate settings from localStorage:', error)
          // エラーの場合はデフォルト値を使用
          return
        }
        // 正常に復元された場合
        if (state?.settings) {
          const normalized = getNormalizedLocalClientSettings(state.settings)
          state.settings = normalized
          console.log('Settings rehydrated from localStorage:', normalized)
        }
      },
    }
  )
)
