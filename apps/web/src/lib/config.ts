/**
 * アプリケーション設定
 * ブラウザのURLから動的に取得する設定値を管理
 */


export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL // `http://${window.location.hostname}:8000`,
} as const

/*  
export const config = {
  // IP（またはホスト名）はそのまま、ポートだけ8000に固定
  apiBaseUrl: `${window.location.protocol}//${window.location.hostname}:8000`,
} as const;
*/