import { useMutation } from '@tanstack/react-query'
import { VideosApi } from '@/generated'

// APIクライアントのセットアップ
const videosApi = new VideosApi()

/**
 * ビデオダウンロード用のカスタムフック
 * React Query の useMutation を使用してビデオダウンロードをハンドル
 * OpenAPI生成ファイル（VideosApi）を使用
 */
export function useVideoDownloadMutation() {
  return useMutation({
    mutationFn: async (data: { id: number; filename?: string }) => {
      // Blob として動画取得
      const response = await videosApi.apiV1VideosIdDownloadGet(data.id, {
        responseType: "blob", // ← 重要
      })
      return { data: response.data, filename: data.filename }
    },
    onSuccess: (result) => {
      const blob = result.data
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename || `video_${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    onError: (error) => {
      console.error('ビデオダウンロードエラー:', error)
      throw error
    },
  })
}
