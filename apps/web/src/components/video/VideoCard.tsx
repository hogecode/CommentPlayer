'use client'

import { Video } from '@/generated/models/Video'
import { MoreVertical, Heart } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize, formatDuration, formatDateTimeJP } from '@/lib/format'

interface VideoCardProps {
  video: Video
  onDelete?: (id: number) => void
}

/**
 * ビデオカードコンポーネント
 * ビデオのサムネイル、タイトル、メタデータを表示
 */
export function VideoCard({ video, onDelete }: VideoCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const thumbnailUrl = `/api/v1/videos/${video.id}/thumbnail`

  return (
    <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors">
      {/* サムネイル */}
      <a href={`/videos/${video.id}`} className="flex-shrink-0 relative group">
        <div className="w-32 h-20 rounded-md overflow-hidden bg-muted">
          <img
            src={thumbnailUrl}
            alt={video.fileName}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          />
        </div>
        {/* 再生時間 */}
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </a>

      {/* メインコンテンツ */}
      <div className="flex-1 min-w-0">
        <a
          href={`/videos/${video.id}`}
          className="block text-base font-semibold truncate hover:text-primary transition-colors"
        >
          {video.fileName}
        </a>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>作成: {formatDateTimeJP(video.createdAt)}</div>
          <div>サイズ: {formatFileSize(video.fileSize)}</div>
          <div>再生数: {video.views}</div>
          <div>更新: {formatDateTimeJP(video.updatedAt)}</div>
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-2 flex-shrink-0 relative">
        {/* お気に入りボタン */}
        <button
          className={`p-2 rounded hover:bg-muted transition-colors ${
            video.liked ? 'text-red-500' : 'text-muted-foreground'
          }`}
          aria-label="お気に入り"
        >
          <Heart size={20} fill={video.liked ? 'currentColor' : 'none'} />
        </button>

        {/* メニューボタン */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
        >
          <MoreVertical size={20} />
        </button>

        {/* メニュー */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 min-w-48">
            <button
              onClick={() => {
                window.location.href = `/videos/${video.id}`
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-muted text-sm"
            >
              再生
            </button>
            <hr className="border-border" />
            <button
              onClick={() => {
                const url = `/api/v1/videos/${video.id}/download`
                window.location.href = url
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-muted text-sm"
            >
              ダウンロード ({formatFileSize(video.fileSize)})
            </button>
            <hr className="border-border" />
            <button
              onClick={() => {
                if (confirm('このビデオを削除しますか？')) {
                  onDelete?.(video.id)
                }
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-sm text-destructive"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
