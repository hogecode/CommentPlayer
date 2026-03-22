import { useEffect, useRef } from 'react'
import { useRegisterSW } from '@/hooks/useRegisterSW'
import { useSettingsStore } from '@/stores/settings-store'
import Message from '@/message'
import { sleep } from '@/lib/utils'
import { getAccessToken } from '@/lib/auth'
import { 
  getLocalStorageSettings, 
  setLocalStorageSettings, 
  getNormalizedLocalClientSettings,
  hashClientSettings,
} from '@/lib/settings'

/**
 * アプリケーション全体の初期化と Service Worker 管理を行うコンポーネント
 */
export function App() {
  const settings = useSettingsStore((state) => state.settings)
  const initializeSettings = useSettingsStore((state) => state.initializeSettings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const syncClientSettingsToServer = useSettingsStore((state) => state.syncClientSettingsToServer)
  const syncClientSettingsFromServer = useSettingsStore((state) => state.syncClientSettingsFromServer)
  
  const isUpdatingWatchedHistoryRef = useRef(false)
  const previousSettingsHashRef = useRef('')

  // Service Worker の登録と更新イベントを管理
  useRegisterSW({
    onRegisteredSW(registration) {
      console.log('Service worker has been registered.')
    },
    onRegisterError(error) {
      console.error('Error during service worker registration:', error)
    },
    onOfflineReady() {
      console.log('Content has been cached for offline use.')
    },
    async onNeedRefresh() {
      console.log('New content is available; please refresh.')
      Message.show('クライアントが新しいバージョンに更新されました。5秒後にリロードします。', 10)
      await sleep(5)
      window.location.reload()
    },
  })

  // 設定を初期化
  useEffect(() => {
    initializeSettings()
  }, [initializeSettings])

  // 設定データの変更を監視して LocalStorage に保存しサーバーに同期する
  useEffect(() => {
    // 視聴履歴の保持件数を変更した際に、既存の視聴履歴件数が上限を超えている場合は削除する
    const watchedHistoryMaxCount = Number.isFinite(settings.video_watched_history_max_count)
      ? Math.max(1, Math.floor(settings.video_watched_history_max_count))
      : 1
    const watchedHistory = settings.watched_history

    if (!isUpdatingWatchedHistoryRef.current && watchedHistory.length > watchedHistoryMaxCount) {
      const removeCount = watchedHistory.length - watchedHistoryMaxCount
      const removeTargets = new Set(
        [...watchedHistory]
          .sort((a, b) => a.updated_at - b.updated_at)
          .slice(0, removeCount),
      )

      const watchedHistoryTrimmed = watchedHistory.filter(
        (history) => !removeTargets.has(history),
      )

      isUpdatingWatchedHistoryRef.current = true
      updateSettings({ watched_history: watchedHistoryTrimmed })
      isUpdatingWatchedHistoryRef.current = false
      return
    }

    // 現在 LocalStorage に保存されている設定データを取得
    const currentSavedSettings = getNormalizedLocalClientSettings(getLocalStorageSettings())

    // 設定データが変更されている場合は、LocalStorage に保存とサーバーに同期する
    const currentHash = hashClientSettings(settings)
    if (previousSettingsHashRef.current !== currentHash) {
      console.log('Client Settings Changed')
      setLocalStorageSettings(settings)
      void syncClientSettingsToServer()
      previousSettingsHashRef.current = currentHash
    }
  }, [settings, updateSettings, syncClientSettingsToServer])

  // ログイン時かつ設定の同期が有効な場合、3秒おきにサーバーから設定を取得する
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (getAccessToken() !== null && settings.sync_settings === true) {
        void syncClientSettingsFromServer()
      }
    }, 3 * 1000)

    return () => clearInterval(intervalId)
  }, [settings.sync_settings, syncClientSettingsFromServer])

  return null
}
