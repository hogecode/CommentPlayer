'use client'

import { EntityVideo } from '@/generated'
import { MoreVertical, Heart, Download, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize, formatDuration, formatDateTimeJP } from '@/lib/format'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader } from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface VideoCardProps {
  video: EntityVideo
  onDelete?: (id: number) => void
}

/**
 * ビデオカードコンポーネント
 * ビデオのサムネイル、タイトル、メタデータを表示
 */
export function VideoCard({ video, onDelete }: VideoCardProps) {
  const thumbnailUrl = `http://100.72.160.115:8000/screenshots/${video.screenshot_file_path}`

  const handleDownload = () => {
    const url = `/api/v1/videos/${video.id}/download`
    window.location.href = url
  }

  return (
    <a href={`/videos/${video.id}`} >
    <Item variant="default">
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
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>{formatDateTimeJP(video.jikkyo_date as string)}</div>
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
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownload}>
              <Download size={16} className="mr-2" />
              ダウンロード ({formatFileSize(video.file_size as number)})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
    </a>
  )
}
