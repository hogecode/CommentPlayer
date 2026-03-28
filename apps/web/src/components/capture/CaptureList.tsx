'use client'

import { EntityCapture } from '@/generated'
import { config } from '@/lib/config'
import { Button } from '@/components/ui/button'
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
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'

interface CaptureListProps {
  title: string
  captures: EntityCapture[]
  total: number
  totalPages?: number
  page?: number
  isLoading?: boolean
  hideHeader?: boolean
  hidePagination?: boolean
  showBackButton?: boolean
  showEmptyMessage?: boolean
  onPageChange?: (page: number) => void
}

/**
 * キャプチャリストコンポーネント
 * 複数のキャプチャをグリッド表示
 */
export function CaptureList({
  title,
  captures,
  total,
  totalPages: totalPagesProp,
  page = 1,
  isLoading = false,
  hideHeader = false,
  hidePagination = false,
  showBackButton = false,
  showEmptyMessage = true,
  onPageChange,
}: CaptureListProps) {
  const itemsPerPage = 12
  const totalPages = totalPagesProp || Math.ceil(total / itemsPerPage)

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
              <div className="flex justify-between items-end gap-3">
                <h2 className="text-2xl font-bold">{title}</h2>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">読み込み中...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{total}件</p>
                )}
              </div>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* コンテンツ */}
      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : total === 0 && showEmptyMessage ? (
          <Empty>
            <EmptyMedia variant="icon">
              <ImageIcon className="w-12 h-12" />
            </EmptyMedia>
            <EmptyContent>
              <h3 className="font-semibold">キャプチャが見つかりません</h3>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="group relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                  <img
                    src={`${config.apiBaseUrl}/captures/${capture.filename}`}
                    alt={capture.filename || `Capture ${capture.id}`}
                    className=" object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                
                {/* Overlay with info on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-medium truncate">{capture.filename}</p>
                  {capture.created_at && (
                    <p className="text-white/70 text-xs">
                      {new Date(capture.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>
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

            {(() => {
              // 表示するページ番号を計算
              const visiblePages = new Set<number>()
              visiblePages.add(1)
              visiblePages.add(totalPages)
              for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
                visiblePages.add(i)
              }

              const sortedPages = Array.from(visiblePages).sort((a, b) => a - b)

              return sortedPages.flatMap((p, idx) => {
                const nextPage = sortedPages[idx + 1]
                const items = [
                  <PaginationItem key={`page-${p}`}>
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
                  </PaginationItem>,
                ]

                if (nextPage && nextPage - p > 1) {
                  items.push(
                    <PaginationItem key={`ellipsis-${p}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return items
              })
            })()}

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
