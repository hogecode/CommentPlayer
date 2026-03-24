'use client'

import { Video } from '@/generated/models/Video'
import { VideoCard } from './VideoCard'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
    <div className="flex flex-col w-full gap-6">
      {/* ヘッダー */}
      {!hideHeader && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.history.back()}
                >
                  <ChevronLeft size={24} />
                </Button>
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
              <NativeSelect
                value={sortOrder}
                onChange={(e) => onSortChange?.(e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">新しい順</option>
                <option value="asc">古い順</option>
              </NativeSelect>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* コンテンツ */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : total === 0 && showEmptyMessage ? (
          <Empty>
            <EmptyMedia variant="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m16 13 4 4m-16 4h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                <circle cx="8.5" cy="9" r="1.5" />
              </svg>
            </EmptyMedia>
            <EmptyContent>
              <h3 className="font-semibold">ビデオが見つかりません</h3>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden divide-y">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {!hidePagination && total > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) onPageChange?.(page - 1)
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // 最初と最後のページと、現在のページの前後を表示
              if (
                p === 1 ||
                p === totalPages ||
                (p >= page - 1 && p <= page + 1)
              ) {
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        onPageChange?.(p)
                      }}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              } else if (
                (p === 2 && page > 3) ||
                (p === totalPages - 1 && page < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={p}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              return null
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) onPageChange?.(page + 1)
                }}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
