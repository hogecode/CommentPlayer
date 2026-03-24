'use client'

import { Video } from '@/generated/models/Video'
import { VideoCard } from './VideoCard'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'

interface VideoListProps {
  title: string
  videos: Video[]
  total: number
  page?: number
  sortOrder?: 'asc' | 'desc'
  isLoading?: boolean
  hideHeader?: boolean
  hideSort?: boolean
  hidePagination?: boolean
  showBackButton?: boolean
  showEmptyMessage?: boolean
  onPageChange?: (page: number) => void
  onSortChange?: (order: 'asc' | 'desc') => void
  onDelete?: (id: number) => void
}

/**
 * ビデオリストコンポーネント
 * 複数のビデオをリスト表示
 */
export function VideoList({
  title,
  videos,
  total,
  page = 1,
  sortOrder = 'desc',
  isLoading = false,
  hideHeader = false,
  hideSort = false,
  hidePagination = false,
  showBackButton = false,
  showEmptyMessage = true,
  onPageChange,
  onSortChange,
  onDelete,
}: VideoListProps) {
  const itemsPerPage = 30
  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="flex flex-col w-full">
      {/* ヘッダー */}
      {!hideHeader && (
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded hover:bg-muted transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              ) : (
                <p className="text-sm text-muted-foreground">{total}件</p>
              )}
            </div>
          </div>

          {/* ソート */}
          {!hideSort && (
            <select
              value={sortOrder}
              onChange={(e) => onSortChange?.(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          )}
        </div>
      )}

      {/* コンテンツ */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : total === 0 && showEmptyMessage ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">ビデオが見つかりませんでした。</p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {!hidePagination && total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className={`px-3 py-1 rounded ${
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
