'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSeriesEpisodeWatchHistoryQuery } from '@/services/useAdminStats'
import type { DtoSeriesEpisodeResponse } from '@/generated/models'

interface SeriesStatsTableProps {
  data: Array<{
    series_id: number
    series_name: string
    total_views: number
    video_count: number
  }>
}

export function SeriesStatsTable({ data }: SeriesStatsTableProps) {
  const [expandedSeriesId, setExpandedSeriesId] = useState<number | null>(null)
  // 展開中のビデオIDは一度に1つだけ（新しいビデオを展開すると他は自動的に閉じる）
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null)

  // TanStack Query でシリーズのエピソード別視聴履歴を取得
  const { data: watchHistoryData, isLoading, error } =
    useSeriesEpisodeWatchHistoryQuery(expandedSeriesId)

  // シリーズ行をクリックした時の処理
  const handleSeriesRowClick = (seriesId: number) => {
    if (expandedSeriesId === seriesId) {
      setExpandedSeriesId(null)
      setExpandedVideoId(null)
      return
    }

    setExpandedSeriesId(seriesId)
    setExpandedVideoId(null)
  }

  // ビデオIDの展開/非展開をトグル（展開時は他のビデオは自動的に閉じる）
  const toggleEpisodeExpanded = (videoId: number) => {
    if (expandedVideoId === videoId) {
      setExpandedVideoId(null)
    } else {
      setExpandedVideoId(videoId)
    }
  }

  // 視聴日時をフォーマット
  const formatWatchedAt = (watchedAt: string | undefined) => {
    if (!watchedAt) return '—'
    try {
      const date = new Date(watchedAt)
      return formatDistanceToNow(date, { addSuffix: true, locale: ja })
    } catch {
      return watchedAt
    }
  }

  return (
    <Card className='bg-black/90 text-white'>
      <CardHeader>
        <CardTitle>シリーズ別再生数</CardTitle>
        <p className='text-sm text-gray-400 mt-2'>
          シリーズをクリックするとエピソード別視聴履歴が表示されます
        </p>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-800'>
              <TableRow>
                <TableHead>シリーズ名</TableHead>
                <TableHead className='text-right'>再生数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((series) => (
                <SeriesRowWithEpisodes
                  key={series.series_id}
                  series={series}
                  isExpanded={expandedSeriesId === series.series_id}
                  onToggle={() => handleSeriesRowClick(series.series_id)}
                  watchHistoryData={
                    expandedSeriesId === series.series_id ? watchHistoryData : null
                  }
                  isLoading={expandedSeriesId === series.series_id && isLoading}
                  error={expandedSeriesId === series.series_id ? error : null}
                  expandedVideoId={expandedVideoId}
                  onToggleEpisode={toggleEpisodeExpanded}
                  formatWatchedAt={formatWatchedAt}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

interface SeriesRowWithEpisodesProps {
  series: {
    series_id: number
    series_name: string
    total_views: number
    video_count: number
  }
  isExpanded: boolean
  onToggle: () => void
  watchHistoryData: any
  isLoading: boolean
  error: Error | null
  expandedVideoId: number | null
  onToggleEpisode: (videoId: number) => void
  formatWatchedAt: (watchedAt: string | undefined) => string
}

function SeriesRowWithEpisodes({
  series,
  isExpanded,
  onToggle,
  watchHistoryData,
  isLoading,
  error,
  expandedVideoId,
  onToggleEpisode,
  formatWatchedAt,
}: SeriesRowWithEpisodesProps) {
  return (
    <>
      {/* シリーズ行 */}
      <TableRow
        onClick={onToggle}
        className='cursor-pointer hover:bg-gray-700 transition-colors'
      >
        {/*<TableCell className='text-center'>
          <span className='text-lg font-bold'>{isExpanded ? '▼' : '▶'}</span>
        </TableCell>*/}
        <TableCell className='font-medium'>{series.series_name}</TableCell>
        <TableCell className='text-right'>
          {series.total_views.toLocaleString()}
        </TableCell>
      </TableRow>

      {/* エピソード別視聴履歴（展開時） */}
      {isExpanded && (
        <>
          {error ? (
            <TableRow className='bg-red-900/30 hover:bg-red-900/30'>
              <TableCell colSpan={3} className='p-4'>
                <div className='text-red-200 text-sm'>
                  {error instanceof Error ? error.message : '視聴履歴の読み込みに失敗しました'}
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableRow className='bg-gray-900/50 hover:bg-gray-900/50'>
              <TableCell colSpan={3} className='p-4'>
                <div className='text-center text-gray-400 text-sm'>読み込み中...</div>
              </TableCell>
            </TableRow>
          ) : watchHistoryData?.episodes && watchHistoryData.episodes.length > 0 ? (
            watchHistoryData.episodes.map((episode: any) => (
              <EpisodeRow
                key={episode.video_id}
                episode={episode}
                isExpanded={expandedVideoId === (episode.video_id || 0)}
                onToggle={() => onToggleEpisode(episode.video_id || 0)}
                formatWatchedAt={formatWatchedAt}
              />
            ))
          ) : (
            <TableRow className='bg-gray-900/50 hover:bg-gray-900/50'>
              <TableCell colSpan={3} className='p-4'>
                <div className='text-center text-gray-400 text-sm'>
                  エピソードデータがありません
                </div>
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  )
}

interface EpisodeRowProps {
  episode: DtoSeriesEpisodeResponse
  isExpanded: boolean
  onToggle: () => void
  formatWatchedAt: (watchedAt: string | undefined) => string
}

function EpisodeRow({
  episode,
  isExpanded,
  onToggle,
  formatWatchedAt,
}: EpisodeRowProps) {
  // ISO 8601フォーマットで日時を表示
  const formatWatchedAtISO = (watchedAt: string | undefined) => {
    if (!watchedAt) return '—'
    try {
      const date = new Date(watchedAt)
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return watchedAt
    }
  }

  return (
    <>
      {/* エピソード行（サブタイトル、再生数を同一行に表示） */}
      <TableRow
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="bg-gray-900/30 hover:bg-gray-700/50 cursor-pointer transition-colors"
      >
        <TableCell className="font-medium">
          &nbsp;&nbsp;&nbsp;&nbsp; 第{episode.episode ?? "N/A"}話
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className="text-gray-300 truncate">
            {(episode.subtitle || "（サブタイトルなし）").length > 35
              ? (episode.subtitle || "（サブタイトルなし）").slice(0, 35) + "…"
              : episode.subtitle || "（サブタイトルなし）"}
          </span>
        </TableCell>

        {/*}
        <TableCell className='text-right'>
          {episode.views?.toLocaleString() || 0}&nbsp;&nbsp;&nbsp;&nbsp;
        </TableCell>*/}
      </TableRow>

      {/* 視聴履歴詳細（エピソード展開時） */}
      {isExpanded &&
        episode.watch_history &&
        episode.watch_history.length > 0 && (
          <TableRow className="bg-gray-900/50 hover:bg-gray-900/50">
            <TableCell colSpan={3} className="p-0">
              <div className="px-4 py-3 pl-12">
                <div className="mb-2 text-xs text-gray-400">
                  視聴履歴（{episode.watch_history.length}件）
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {episode.watch_history.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center text-xs px-2 py-1 w-60 bg-gray-800/30 rounded"
                    >
                      <span className="text-gray-400">
                        ▪ {formatWatchedAtISO(item.watched_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}

      {/* 視聴履歴がない場合 */}
      {isExpanded &&
        (!episode.watch_history || episode.watch_history.length === 0) && (
          <TableRow className="bg-gray-900/50 hover:bg-gray-900/50">
            <TableCell colSpan={3} className="p-0">
              <div className="px-4 py-3 pl-12 text-xs text-gray-400">
                視聴履歴がありません
              </div>
            </TableCell>
          </TableRow>
        )}
    </>
  );
}
