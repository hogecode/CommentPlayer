'use client'

import { EntityVideo } from '@/generated'
import { MoreVertical, Heart, Download, Trash2, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize, formatDuration, formatDateTimeJP, formatVideoDateTimeWithDuration } from '@/lib/format'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useVideoDownloadMutation } from '@/services/useVideoDownload'
import { useRegenerateThumbnailMutation } from '@/services/useVideos'
import Message from '@/message'

interface VideoCardProps {
  video: EntityVideo
  onDelete?: (id: number) => void
}

/**
 * ビデオカードコンポーネント
 * ビデオのサムネイル、タイトル、メタデータを表示
 */
export function VideoCard({ video, onDelete }: VideoCardProps) {
  const thumbnailUrl = `${import.meta.env.VITE_API_BASE_URL}/screenshots/${video.screenshot_file_path}`
  const downloadMutation = useVideoDownloadMutation()
  const regenerateThumbnailMutation = useRegenerateThumbnailMutation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handleDownload = async () => {
    Message.info('ビデオをダウンロードしています。しばらくお待ちください...')

    if (!video.id) {
      console.error('ビデオIDが見つかりません')
      return
    }

    try {
      setIsDownloading(true)
      await downloadMutation.mutateAsync({
        id: video.id,
        filename: video.file_name,
      })
    } catch (error) {
      console.error('ダウンロードエラー:', error)
      Message.error('ビデオのダウンロードに失敗しました')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleRegenerateThumbnail = async () => {
    Message.info('サムネイルを再生成しています。しばらくお待ちください...')

    if (!video.id) {
      console.error('ビデオIDが見つかりません')
      return
    }

    try {
      setIsRegenerating(true)
      await regenerateThumbnailMutation.mutateAsync({
        id: video.id,
      })
      Message.success('サムネイルが正常に再生成されました')
    } catch (error) {
      console.error('サムネイル再生成エラー:', error)
      Message.error('サムネイルの再生成に失敗しました')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <a href={`/videos/${video.id}`} >
    <Item variant="default"className="transition-colors hover:bg-gray-800 rounded-md">
      {/* サムネイル */}
      <ItemMedia variant="image" className="h-27 w-48">
          <img
            src={thumbnailUrl}
            alt={video.file_name}
            loading="lazy"
            className="w-full h-full object-contain hover:opacity-80 transition-opacity"
          />
      </ItemMedia>

      {/* メインコンテンツ */}
      <ItemContent>
        <ItemHeader>
          <ItemTitle>
              {video.file_name}
          </ItemTitle>
        </ItemHeader>

        <ItemDescription>
          <div className="gap-2 text-xs text-muted-foreground">
            <div>{formatVideoDateTimeWithDuration(video.jikkyo_date as string, video.duration ?? 0)}</div>
          </div>
        </ItemDescription>
      </ItemContent>

      {/* アクション */}
      <ItemActions>
        {/* お気に入りボタン */}
        {/* TODO: ロジック追加 */}
        <Button
          variant="ghost"
          size="icon-sm"
          className={video.liked ? 'text-red-500' : 'text-muted-foreground'}
          aria-label="お気に入り"
        >
          <Plus size={18} fill={video.liked ? 'currentColor' : 'none'} />
        </Button>

        {/* メニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-35">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault()
              handleDownload()
            }}>
              <Download size={32} className="mr-2" />
              <p className="text-xs">ダウンロード ({formatFileSize(video.file_size ?? 0)})</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault()
              handleRegenerateThumbnail()
            }} disabled={isRegenerating}>
              <RefreshCw size={32} className="mr-2" />
              <p className="text-xs">{isRegenerating ? '再生成中...' : 'サムネイル再生成'}</p>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
    </a>
  )
}
