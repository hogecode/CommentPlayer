/**
 * OpenAPI生成クライアントのセットアップ
 * アプリケーション初期化時にこのファイルをインポートして、
 * エラーインターセプターを設定
 */

import globalAxios from 'axios'
import { setupErrorInterceptor } from '@/lib/api-interceptor'

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
  // グローバルなAxiosインスタンスにエラーインターセプターを設定
  setupErrorInterceptor(globalAxios)
}

export default {
  initializeApiClient,
}
