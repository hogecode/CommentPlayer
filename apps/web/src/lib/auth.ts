/**
 * 認証関連のユーティリティ関数
 */

const ACCESS_TOKEN_KEY = 'access_token'

/**
 * アクセストークンを取得する
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * アクセストークンを設定する
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * アクセストークンを削除する
 */
export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * ユーザーがログインしているかどうかを確認する
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}
