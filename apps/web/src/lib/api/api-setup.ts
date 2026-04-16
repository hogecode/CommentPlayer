/**
 * OpenAPI生成クライアントのセットアップ
 * アプリケーション初期化時にこのファイルをインポートして、
 * エラーインターセプターと認証インターセプターを設定
 */

import globalAxios from 'axios'
import { setupErrorInterceptor, setupAuthInterceptor, setupDynamicBaseURLInterceptor } from '@/lib/api/api-interceptor'

/**
 * APIクライアントの初期化
 * main.tsx or App.tsx で呼び出す
 *
 * 使用例:
 * ```typescript
 * import { initializeApiClient } from '@/lib/api-setup'
 *
 * // アプリケーション起動時
 * initializeApiClient()
 * ```
 */
export function initializeApiClient(): void {
  // 動的ベースURLインターセプターを最初に設定
  // （相対URLを絶対URLに変換する必要があるため、最初に実行）
  setupDynamicBaseURLInterceptor(globalAxios)
  
  // グローバルなAxiosインスタンスに認証インターセプターを設定
  // （リクエストインターセプターはレスポンスインターセプターより先に実行される）
  setupAuthInterceptor(globalAxios)
  
  // エラーインターセプターを設定
  setupErrorInterceptor(globalAxios)
}

export default {
  initializeApiClient,
}
