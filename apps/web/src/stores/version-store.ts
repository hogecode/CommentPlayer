'use client'

import { create } from 'zustand'

interface VersionStoreState {
  client_version: string
  latest_version: string
  is_client_develop_version: boolean
  is_update_available: boolean
  fetchServerVersion: () => Promise<void>
}

export const useVersionStore = create<VersionStoreState>((set, get) => ({
  client_version: 'unknown',
  latest_version: 'unknown',
  is_client_develop_version: false,
  is_update_available: false,

  /**
   * サーバーからバージョン情報を取得
   */
  fetchServerVersion: async () => {
    try {
      // const token = getAccessToken()
      
      // TODO: サーバーAPIエンドポイント(version)を実装したら呼び出す
      // const response = await fetch('/api/version', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // })
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch version: ${response.statusText}`)
      // }
      // const data = await response.json()
      // set({
      //   client_version: data.client_version || 'unknown',
      //   latest_version: data.latest_version || 'unknown',
      //   is_client_develop_version: data.is_client_develop_version || false,
      //   is_update_available: data.is_update_available || false,
      // })

      // For now, set default values
      set({
        client_version: 'v1.0.0',
        latest_version: 'v1.0.0',
        is_client_develop_version: false,
        is_update_available: false,
      })
      
      console.log('Version fetched successfully')
    } catch (error) {
      console.error('Error fetching version:', error)
    }
  },
}))
