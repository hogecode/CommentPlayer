'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { useCapturesInfiniteQuery, useGetCapturesSeriesList } from '@/services/useCaptures'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { config } from '@/lib/config'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyContent, EmptyMedia } from '@/components/ui/empty'
import { Image as ImageIcon, MoreVertical, ChevronDown } from 'lucide-react'
import { DeleteCaptureModal } from '@/components/capture/DeleteCaptureModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useCapturesStore } from '@/stores/captures-store'
import { useQueryClient } from '@tanstack/react-query'

export default function CapturesPage() {
  const limit = 40
  const navigate = useNavigate({ from: '/captures' })
  const queryClient = useQueryClient()

  // ストア
  const { setCaptureList, addCaptures, setPaginationInfo, sortKey, sortOrder, setSortConfig, currentSeriesId, setCurrentSeriesId } = useCapturesStore()
  
  // シリーズ一覧を取得
  const { data: seriesListData, isLoading: isSeriesLoading } = useGetCapturesSeriesList()

  // 削除モーダルの状態管理
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    captureId: number | null
    filename: string
  }>({
    open: false,
    captureId: null,
    filename: '',
  })

  // 無限ページネーションで取得
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCapturesInfiniteQuery({
    series_id: currentSeriesId || undefined,
    limit,
    sort_key: sortKey,
    sort_order: sortOrder,
  })

  // データをストアに保存
  useEffect(() => {
    if (data?.pages) {
      const allCaptures = data.pages.flatMap((page) => page.data || [])
      if (allCaptures.length > 0) {
        // 最初のページの場合は全て置き換え、以降は追加
        if (data.pages.length === 1) {
          setCaptureList(allCaptures)
        } else {
          addCaptures(allCaptures.slice((data.pages.length - 1) * limit))
        }
      }
      // ページネーション情報を更新
      const currentPage = data.pages[data.pages.length - 1]?.pagination?.page || 1
      setPaginationInfo(currentPage, limit)
    }
  }, [data, limit, setCaptureList, addCaptures, setPaginationInfo])

  const observerTarget = useRef<HTMLDivElement>(null)

  const handleDeleteClick = (captureId: number, filename: string) => {
    setDeleteModalState({
      open: true,
      captureId,
      filename,
    })
  }

  const handleDeleteModalClose = () => {
    setDeleteModalState({
      open: false,
      captureId: null,
      filename: '',
    })
  }

  // シリーズ選択変更ハンドラー
  const handleSeriesChange = (value: string) => {
    // value が空文字列の場合は null（すべてのシリーズ）
    const seriesId = value === '' ? null : parseInt(value, 10);
    setCurrentSeriesId(seriesId)
    // キャプチャリストをリセット（新しいシリーズで再取得させる）
    setCaptureList([])
    // React Query のキャッシュを無効化
    queryClient.invalidateQueries({ queryKey: ['captures', 'infinite'] })
  }

  // ソート変更ハンドラー
  const handleSortChange = (value: string) => {
    // value のフォーマット: "sortKey_sortOrder" (例: "created_at_desc")
    const [newSortKey, newSortOrder] = value.split('_')
    if (newSortKey === 'id' || newSortKey === 'created_at') {
      if (newSortOrder === 'asc' || newSortOrder === 'desc') {
        setSortConfig(newSortKey, newSortOrder)
        // キャプチャリストをリセット（新しいソート設定で再取得させる）
        setCaptureList([])
        // React Query のキャッシュを無効化
        queryClient.invalidateQueries({ queryKey: ['captures', 'infinite'] })
      }
    }
  }

  // IntersectionObserverを使用した自動ロード
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // すべてのページのキャプチャを集約
  const allCaptures = data?.pages.flatMap((page) => page.data || []) || []
  const total = data?.pages[0]?.pagination?.total || 0

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'キャプチャ' }]} />

        <div className="flex flex-col w-full gap-6">
          {/* ヘッダー */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex justify-between items-end gap-3">
                <h2 className="text-2xl font-bold">キャプチャ</h2>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">読み込み中...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{total}件</p>
                )}
              </div>
            </div>

            {/* フィルタとソート */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* シリーズ選択ドロップダウン */}
              <div className="flex items-center gap-2">
                <label htmlFor="series-select" className="text-sm text-muted-foreground">
                  シリーズ：
                </label>
                <NativeSelect
                  id="series-select"
                  value={currentSeriesId ? currentSeriesId.toString() : ''}
                  onChange={(e) => handleSeriesChange(e.currentTarget.value)}
                  disabled={isSeriesLoading}
                  className="w-56"
                >
                  <NativeSelectOption value=""  className="bg-black/90">すべてのシリーズ</NativeSelectOption>
                  {(seriesListData as {
                    data?: Array<{
                      id: number
                      syobocal_title_name?: string | null
                      series_name_file?: string | null
                    }>
                  } | undefined)?.data?.map((series) => (
                    <NativeSelectOption key={series.id} value={series.id.toString()} className="bg-black/90">
                      {series.syobocal_title_name || series.series_name_file}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* ソート選択ドロップダウン */}
              <div className="flex items-center gap-2">
                <NativeSelect
                  id="sort-select"
                  value={`${sortKey}_${sortOrder}`}
                  onChange={(e) => handleSortChange(e.currentTarget.value)}
                  className="w-48"
                >
                  <NativeSelectOption value="id_desc" className="bg-black/90">降順</NativeSelectOption>
                  <NativeSelectOption value="id_asc"  className="bg-black/90">昇順</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : total === 0 ? (
              <Empty>
                <EmptyMedia variant="icon">
                  <ImageIcon className="w-12 h-12" />
                </EmptyMedia>
                <EmptyContent>
                  <h3 className="font-semibold">キャプチャが見つかりません</h3>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allCaptures.map((capture) => (
                    <div
                      key={capture.id}
                      className="group relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => {
                        if (capture.id) {
                          navigate({ to: '/captures/$id', params: { id: capture.id.toString() } })
                        }
                      }}
                    >
                      <img
                        src={`${config.apiBaseUrl}/photos/${capture.filename}`}
                        alt={capture.filename || `Capture ${capture.id}`}
                        loading='lazy'
                        className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Overlay with info on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-60 transition-opacity duration-200 flex flex-col justify-end p-3">
                        <div className="flex justify-end items-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-white hover:bg-white/20"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  if (capture.id) {
                                    handleDeleteClick(
                                      capture.id,
                                      capture.filename || `Capture ${capture.id}`
                                    )
                                  }
                                }}
                              >
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium truncate">{capture.filename}</p>
                          {capture.created_at && (
                            <p className="text-white/70 text-xs">
                              {new Date(capture.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 自動ロード対象 */}
                <div ref={observerTarget} className="mt-8 flex justify-center">
                  {isFetchingNextPage && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>

                {/* さらに読み込むエリア */}
                {!hasNextPage && allCaptures.length > 0 && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">これ以上キャプチャがありません</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 削除確認モーダル */}
        {deleteModalState.captureId !== null && (
          <DeleteCaptureModal
            captureId={deleteModalState.captureId}
            filename={deleteModalState.filename}
            open={deleteModalState.open}
            onOpenChange={handleDeleteModalClose}
          />
        )}
      </div>
    </RootLayout>
  )
}
