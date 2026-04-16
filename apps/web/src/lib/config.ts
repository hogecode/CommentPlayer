/**
 * アプリケーション設定
 * ブラウザのURLから動的に取得する設定値を管理
 */

export const config = {
  // APIのベースURL - ブラウザのURLから動的に取得
  apiBaseUrl: window.location.origin,
} as const
