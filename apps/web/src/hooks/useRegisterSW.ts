import { useEffect, useRef } from 'react'

interface RegisterSWOptions {
  onRegisteredSW?: (registration: ServiceWorkerRegistration) => void
  onRegisterError?: (error: unknown) => void
  onOfflineReady?: () => void
  onNeedRefresh?: () => void
}

/**
 * Service Worker 登録を管理するカスタムフック
 * Vite PWA プラグインを使用して Service Worker をセットアップ
 */
export function useRegisterSW(options: RegisterSWOptions = {}) {
  const updateServiceWorkerRef = useRef<(reloadPage?: boolean) => Promise<void>>(() => Promise.resolve())

  useEffect(() => {
    // Service Worker 登録は Vite PWA プラグインが自動的に行う
    // ここではイベントリスナーを設定するだけ
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration) {
            options.onRegisteredSW?.(registration)
          }

          // Service Worker の更新を監視
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新しいバージョンが利用可能
                  options.onNeedRefresh?.()
                }
              })
            }
          })
        })
      }).catch((error) => {
        options.onRegisterError?.(error)
      })

      // オフライン対応の確認
      if (navigator.onLine === false) {
        options.onOfflineReady?.()
      } else {
        window.addEventListener('online', () => {
          // オンラインになった時の処理
        })
        window.addEventListener('offline', () => {
          // オフラインになった時の処理
        })
      }
    }
  }, [options])

  // Service Worker を更新する関数
  const updateServiceWorker = async (reloadPage = false) => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        if (reloadPage) {
          window.location.reload()
        }
      }
    }
  }

  return { updateServiceWorker }
}
