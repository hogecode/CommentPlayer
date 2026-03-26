'use client'

import { EntityVideo } from '@/generated'
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

interface VideoListProps {
  title: string
  videos: EntityVideo[]
  total: number
  totalPages?: number
  page?: number
  sortOrder?: 'asc' | 'desc'
  year?: number | null
  yearList?: number[]
  isLoading?: boolean
  hideHeader?: boolean
  hideSort?: boolean
  hidePagination?: boolean
  showBackButton?: boolean
  showEmptyMessage?: boolean
  onPageChange?: (page: number) => void
  onSortChange?: (order: 'asc' | 'desc') => void
  onYearChange?: (year: number | null) => void
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
  totalPages: totalPagesProp,
  page = 1,
  sortOrder = 'desc',
  year,
  yearList = [],
  isLoading = false,
  hideHeader = false,
  hideSort = false,
  hidePagination = false,
  showBackButton = false,
  showEmptyMessage = true,
  onPageChange,
  onSortChange,
  onYearChange,
  onDelete,
}: VideoListProps) {
  const itemsPerPage = 30
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
                  <p className="text-xs text-muted-foreground ">{total}件</p>
                )}
              </div>
            </div>

            {/* 年フィルタとソート */}
            <div className="flex gap-2">
              {/* 年フィルタ */}
              {yearList.length > 0 && (
                <NativeSelect
                  value={year ?? ''}
                  onChange={(e) =>
                    onYearChange?.(e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                >
                  <option value="">全年度</option>
                  {yearList.map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </NativeSelect>
              )}
              
              {/* ソート */}
              {!hideSort && (
                <NativeSelect
                  value={sortOrder}
                  onChange={(e) =>
                    onSortChange?.(e.target.value as "asc" | "desc")
                  }
                >
                  <option value="desc">新しい順</option>
                  <option value="asc">古い順</option>
                </NativeSelect>
              )}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* コンテンツ */}
      <div className="flex-1 bg-[#2f221f] rounded-sm p-4">
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
              <>
                <VideoCard key={video.id} video={video} onDelete={onDelete} />
                <Separator />
              </>
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
                  e.preventDefault();
                  if (page > 1) onPageChange?.(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {(() => {
              // 表示するページ番号を計算
              const visiblePages = new Set<number>();
              visiblePages.add(1);
              visiblePages.add(totalPages);
              for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
                visiblePages.add(i);
              }
              
              const sortedPages = Array.from(visiblePages).sort((a, b) => a - b);
              
              return sortedPages.flatMap((p, idx) => {
                const nextPage = sortedPages[idx + 1];
                const items = [
                  <PaginationItem key={`page-${p}`}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange?.(p);
                      }}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>,
                ];
                
                if (nextPage && nextPage - p > 1) {
                  items.push(
                    <PaginationItem key={`ellipsis-${p}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return items;
              });
            })()}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange?.(page + 1);
                }}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
