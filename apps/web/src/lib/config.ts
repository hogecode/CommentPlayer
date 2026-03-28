/**
 * アプリケーション設定
 * 環境変数から読み込む設定値を管理
 */

export const config = {
  // APIのベースURL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
} as const
