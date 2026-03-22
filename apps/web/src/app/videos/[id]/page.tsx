import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import DPlayerVideo from '@/components/video'
import type { VideoResponse } from '@/types/video'
import { sampleDanmaku } from '@/misc/sampleDanmaku'

/** DPlayer の Comment 型 */
interface Comment {
  id?: string
  author?: string
  time: number
  text: string
  color: string
  type: 'top' | 'right' | 'bottom'
  size: 'big' | 'medium' | 'small'
}

/**
 * ビデオページコンポーネント
 *
 * URLパラメータから動画IDを取得し、バックエンドAPIを呼び出して
 * ビデオデータ（src + コメント）を取得し、DPlayerVideoに渡す
 */
export default function VideoPage() {
  const { id: videoId } = useParams({ from: '/videos/$id' })

  const [videoData, setVideoData] = useState<VideoResponse | null>(null)
  const [commentList, setCommentList] = useState<Comment[]>(sampleDanmaku)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // バックエンドから動画データを取得
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // APIエンドポイント: /api/videos/{id}
        const apiUrl = `http://localhost:8000/api/v1/videos/${videoId}`
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data: VideoResponse = await response.json()

        if (!data.is_success) {
          throw new Error('API returned is_success: false')
        }

        setVideoData(data)

        // コメントデータを変換
        if (data.comments && Array.isArray(data.comments)) {
          const convertedComments: Comment[] = data.comments.map((comment, index) => ({
            id: `${index}`,
            author: comment.author || 'Anonymous',
            time: comment.time,
            text: comment.text,
            color: comment.color || '#ffffff',
            type: comment.type || 'right',
            size: comment.size || 'medium',
          }))
          setCommentList(convertedComments)
        }
      } catch (err) {
        // ローカル開発時はサンプルデータを使用
        console.warn('Failed to fetch video data, using sample data:', err)
        setCommentList(sampleDanmaku)
        setVideoData({
          is_success: true,
          src: '/blank30.mp4',
          title: `Video ${videoId}`,
          comments: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideoData()
    }
  }, [videoId])

  const videoSrc = videoData?.src || '/blank30.mp4'
  const videoTitle = videoData?.title || `弾幕プレイヤー - ${videoId}`

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
        <div className="text-white text-xl">読み込み中...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl font-bold mb-6">{videoTitle}</h1>
      {error && (
        <div className="text-red-500 text-sm mb-4">
          エラー: {error}
        </div>
      )}
      <DPlayerVideo
        src={videoSrc}
        commentList={commentList}
      />
    </main>
  )
}
