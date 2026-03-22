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
import { setupErrorInterceptor } from '@/lib/api-interceptor'

/**
 * エラーインターセプターが自動的に設定されたBaseAPI
 * OpenAPI生成のBaseAPIを拡張して、エラーハンドリングを自動化
 */
export class WrappedBaseAPI extends BaseAPI {
  constructor(
    configuration?: Configuration,
    basePath?: string,
    axiosInstance?: AxiosInstance
  ) {
    super(configuration, basePath, axiosInstance)

    // Axiosインスタンスにエラーインターセプターを設定
    if (axiosInstance) {
      setupErrorInterceptor(axiosInstance)
    }
  }
}

export default WrappedBaseAPI
