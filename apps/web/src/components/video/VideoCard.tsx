'use client'

import { EntityVideo } from '@/generated'
import { MoreVertical, Heart, Download, Trash2, Plus, RefreshCw, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
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
import { CHANNEL_ID_TO_NAME } from '@/constant'

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
  const channelLogoUrl = video.channel_id ? `/assets/images/logos/ch${video.channel_id}.png` : null
  const downloadMutation = useVideoDownloadMutation()
  const regenerateThumbnailMutation = useRegenerateThumbnailMutation()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const settingsStore = useSettingsStore()
  const isInMylist = settingsStore.settings.mylist.some(item => item.id === video.id)

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
    <a href={`/videos/${video.id}`}>
      <Item
        variant="default"
        className="transition-colors hover:bg-gray-800 rounded-md"
      >
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
            <ItemTitle className="text-xs">
              {video.series?.syobocal_title_id
                ? `${video.series.syobocal_title_name ?? ""} #${video.episode} ${video.subtitle ?? ""}`
                : `${video.file_name}`}
            </ItemTitle>
          </ItemHeader>

          <ItemDescription>
            <div className="gap-2 text-[10px] text-muted-foreground">
              <div className="flex items-end mb-1">
                {video.series?.syobocal_title_name && (
                  <>
                    {channelLogoUrl !== null && (
                      <img
                        src={channelLogoUrl}
                        alt={`Channel ${video.channel_id} logo`}
                        className="h-4.5 w-8 shrink-0"
                      />
                    )}
                    <span>&nbsp;&nbsp;</span>
                    <div className="line-clamp-1">{video.channel_id ? CHANNEL_ID_TO_NAME[video.channel_id] : ''}</div>
                  </>
                )}
              </div>
              <div className="line-clamp-2">
                {formatVideoDateTimeWithDuration(
                  video.jikkyo_date as string,
                  video.duration ?? 0,
                )}
              </div>
            </div>
          </ItemDescription>
        </ItemContent>

        {/* アクション */}
        <ItemActions>
          {/* お気に入りボタン */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!isInMylist) {
                // 追加する場合
                const newMylist = [
                  ...settingsStore.settings.mylist,
                  { id: video.id, created_at: Date.now() },
                ];
                settingsStore.updateSettings({ mylist: newMylist });
                Message.success("マイリストに追加しました");
              } else {
                // 削除する場合
                const newMylist = settingsStore.settings.mylist.filter(
                  (item) => item.id !== video.id,
                );
                settingsStore.updateSettings({ mylist: newMylist });
              }
            }}
            className={isInMylist ? "text-blue-500" : "text-muted-foreground"}
            aria-label="マイリストに追加"
          >
            {isInMylist ? (
              <CheckSquare size={18} fill="currentColor" />
            ) : (
              <Plus size={18} />
            )}
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
              >
                <Download size={32} className="mr-2" />
                <p className="text-xs">
                  ダウンロード ({formatFileSize(video.file_size ?? 0)})
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleRegenerateThumbnail();
                }}
                disabled={isRegenerating}
              >
                <RefreshCw size={32} className="mr-2" />
                <p className="text-xs">
                  {isRegenerating ? "再生成中..." : "サムネイル再生成"}
                </p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    </a>
  );
}
