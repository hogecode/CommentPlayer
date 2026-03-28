/**
 * Axiosインターセプター設定
 * - リクエストインターセプター: JWT認証トークンを自動追加
 * - レスポンスインターセプター: エラーレスポンスを処理してユーザーにメッセージ表示
 */

import type { AxiosInstance, AxiosError } from 'axios'
import Message from '@/message'
import { useAuthStore } from '@/stores/auth-store'

/**
 * APIエラーレスポンスの型定義
 */
interface ApiErrorResponse {
  message?: string
  error?: string
  detail?: string
  code?: string | number
  [key: string]: any
}

/**
 * Axiosインスタンスにエラーインターセプターを設定
 * @param axiosInstance - インターセプターを適用するAxiosインスタンス
 */
export function setupErrorInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error)
      return Promise.reject(error)
    }
  )
}

/**
 * APIエラーを処理してユーザーにメッセージを表示
 * @param error - Axiosエラーオブジェクト
 */
function handleApiError(error: AxiosError<ApiErrorResponse>): void {
  // ネットワークエラー
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') {
      Message.error('ネットワークに接続できません。')
    } else if (error.message === 'canceled') {
      // キャンセルされたリクエストは表示しない
      return
    } else {
      Message.error('リクエストに失敗しました。')
    }
    return
  }

  const { status, data } = error.response
  const errorMessage = extractErrorMessage(data, status)

  // ステータスコード別の処理
  switch (status) {
    case 400:
      Message.error(`入力エラー: ${errorMessage}`)
      break
    case 401:
      Message.error('認証が無効です。再度ログインしてください。')
      // ここでログイン画面へリダイレクトなど
      break
    case 403:
      Message.error('このアクションは許可されていません。')
      break
    case 404:
      Message.error(`見つかりません: ${errorMessage}`)
      break
    case 409:
      Message.warning(`競合エラー: ${errorMessage}`)
      break
    case 422:
      Message.error(`検証エラー: ${errorMessage}`)
      break
    case 500:
      // 500は多すぎるので非表示
      break
    case 502:
    case 503:
    case 504:
      Message.error('サーバーは現在利用できません。しばらく待ってからもう一度お試しください。')
      break
    default:
      Message.error(errorMessage || `エラーが発生しました。(${status})`)
  }
}

/**
 * APIレスポンスからエラーメッセージを抽出
 * @param data - APIレスポンスデータ
 * @param status - HTTPステータスコード
 * @returns エラーメッセージ
 */
function extractErrorMessage(data: ApiErrorResponse | undefined, status: number): string {
  if (!data) {
    return `エラーコード: ${status}`
  }

  // メッセージフィールドの優先順位でエラーメッセージを取得
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  // バリデーションエラーの場合
  if (typeof data === 'object' && Object.keys(data).length > 0) {
    const messages = Object.entries(data)
      .filter(([key]) => !['code', 'message', 'error', 'detail'].includes(key))
      .map(([, value]) => {
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return String(value)
      })
      .filter(msg => msg.trim())

    if (messages.length > 0) {
      return messages.join('; ')
    }
  }

  return `エラーコード: ${status}`
}

/**
 * 認証インターセプターを設定
 * リクエストヘッダーに自動的にJWT認証トークンを含める
 * @param axiosInstance - インターセプターを適用するAxiosインスタンス
 */
export function setupAuthInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config) => {
      // authstoreからアクセストークンを取得
      const { accessToken } = useAuthStore.getState()
      
      // トークンが存在する場合、ヘッダーに追加
      if (!accessToken) {
        console.warn('アクセストークンが見つかりません。認証が必要なAPIリクエストは失敗する可能性があります。')
        return config
      }
      config.headers.Authorization = `Bearer ${accessToken}`
      return config
    },
    (error) => Promise.reject(error)
  )
}

/**
 * 特定のエラーコード/メッセージに対してカスタム処理を行う
 * 必要に応じてこの関数を拡張してください
 * @param error - Axiosエラーオブジェクト
 */
export function handleCustomApiError(
  error: AxiosError<ApiErrorResponse>,
  customHandler?: (error: AxiosError<ApiErrorResponse>) => void
): void {
  if (customHandler) {
    customHandler(error)
  } else {
    handleApiError(error)
  }
}

export default {
  setupErrorInterceptor,
  setupAuthInterceptor,
  handleApiError,
  handleCustomApiError,
}
