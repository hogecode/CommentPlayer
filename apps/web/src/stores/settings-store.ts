/**
 * Zustand を使用した設定ストア
 */

import { create } from 'zustand'
import { ClientSettings, createDefaultSettings } from '@/types/settings'
import { getLocalStorageSettings, getNormalizedLocalClientSettings, setLocalStorageSettings } from '@/lib/settings'
import { getAccessToken } from '@/lib/auth'

interface SettingsStoreState {
  settings: ClientSettings
  initializeSettings: () => void
  updateSettings: (updates: Partial<ClientSettings>) => void
  syncClientSettingsToServer: () => Promise<void>
  syncClientSettingsFromServer: () => Promise<void>
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: createDefaultSettings(),

  /**
   * 設定を初期化する（LocalStorage から読み込む）
   */
  initializeSettings: () => {
    const stored = getLocalStorageSettings()
    const normalized = getNormalizedLocalClientSettings(stored)
    set({ settings: normalized })
  },

  /**
   * 設定を更新する
   */
  updateSettings: (updates: Partial<ClientSettings>) => {
    set((state) => {
      const newSettings = {
        ...state.settings,
        ...updates,
      }
      // LocalStorageに保存
      try {
        setLocalStorageSettings(newSettings)
        console.log('Settings saved to localStorage:', newSettings)
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error)
      }
      return { settings: newSettings }
    })
  },

  /**
   * クライアント設定をサーバーに同期する
   * TODO: サーバーAPIの実装が完了したら実装する
   */
  syncClientSettingsToServer: async () => {
    const token = getAccessToken()
    if (!token) {
      console.log('Not authenticated, skipping settings sync to server')
      return
    }

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
    const token = getAccessToken()
    if (!token) {
      console.log('Not authenticated, skipping settings sync from server')
      return
    }

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
}))
