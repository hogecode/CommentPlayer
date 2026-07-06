/**
 * OpenAPI生成クライアント用の共通設定
 * 全てのAPIクライアントで使用する Configuration オブジェクトを定義
 */

import { Configuration } from '@/generated/configuration'

// 共通の Configuration オブジェクト
const apiConfiguration = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL 
})

export { apiConfiguration }
export default apiConfiguration
