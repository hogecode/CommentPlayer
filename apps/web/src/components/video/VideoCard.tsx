'use client'

import { Video } from '@/generated/models/entity-video'
import { MoreVertical, Heart, Download, Trash2 } from 'lucide-react'
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
  video: Video
  onDelete?: (id: number) => void
}

/**
 * ビデオカードコンポーネント
 * ビデオのサムネイル、タイトル、メタデータを表示
 */
export function VideoCard({ video, onDelete }: VideoCardProps) {
  const thumbnailUrl = `http://localhost:8000/screenshots/${video.screenshot_file}/thumbnail`

  const handleDownload = () => {
    const url = `/api/v1/videos/${video.id}/download`
    window.location.href = url
  }

  return (
    <a href={`/videos/${video.id}`} >
    <Item variant="default">
      {/* サムネイル */}
      <ItemMedia variant="image">
        <a href={`/videos/${video.id}`} className="relative w-full h-full">
          <img
            src={thumbnailUrl}
            alt={video.fileName}
            loading="lazy"
            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
          />
        </a>
      </ItemMedia>

      {/* メインコンテンツ */}
      <ItemContent>
        <ItemHeader>
          <ItemTitle>
            <a
              href={`/videos/${video.id}`}
              className="hover:text-primary transition-colors truncate"
            >
              {video.fileName}
            </a>
          </ItemTitle>
        </ItemHeader>

        <ItemDescription>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>作成: {formatDateTimeJP(video.createdAt)}</div>
            <div>サイズ: {formatFileSize(video.fileSize)}</div>
            <div>再生数: {video.views}</div>
            <div>更新: {formatDateTimeJP(video.updatedAt)}</div>
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
          <Heart size={18} fill={video.liked ? 'currentColor' : 'none'} />
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
              ダウンロード ({formatFileSize(video.fileSize)})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
    </a>
  )
}
