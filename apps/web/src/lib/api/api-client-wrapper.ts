/**
 * OpenAPI生成BaseAPIのラッパークラス
 * 自動的にエラーインターセプターが適用されます
 *
 * このクラスを継承してカスタムAPIクライアントを作成してください
 * 例: class VideosApi extends WrappedBaseAPI { ... }
 */

import type { Configuration } from '@/generated/configuration'
import { BaseAPI } from '@/generated/base'
import type { AxiosInstance } from 'axios'
import { setupAuthInterceptor, setupErrorInterceptor, setupDynamicBaseURLInterceptor } from '@/lib/api/api-interceptor'

/**
 * エラーインターセプターが自動的に設定されたBaseAPI
 * OpenAPI生成のBaseAPIを拡張して、エラーハンドリングを自動化
 * 動的ベースURL設定も自動適用
 */
export class WrappedBaseAPI extends BaseAPI {
  constructor(
    configuration?: Configuration,
    basePath?: string,
    axiosInstance?: AxiosInstance
  ) {
    super(configuration, basePath, axiosInstance)

    // Axiosインスタンスにインターセプターを設定
    if (axiosInstance) {
      // 動的ベースURLインターセプターを最初に設定
      setupDynamicBaseURLInterceptor(axiosInstance)
      
      // 認証インターセプターを設定
      setupAuthInterceptor(axiosInstance)
      
      // エラーインターセプターを設定
      setupErrorInterceptor(axiosInstance)
    }
  }
}

export default WrappedBaseAPI
