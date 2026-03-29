'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { VideoList } from '@/components/video/VideoList'
import { useVideosQuery } from '@/services/useVideos'
import { useSettingsStore } from '@/stores/settings-store'
import { useEffect, useState } from 'react'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '@/components/ui/empty'

export default function WatchedHistoryPage() {
  const settings = useSettingsStore((state) => state.settings)
  const [videoIds, setVideoIds] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  // 設定ストアから視聴履歴の動画IDを抽出（降順でソート）
  useEffect(() => {
    if (settings.watched_history && settings.watched_history.length > 0) {
      const ids = settings.watched_history
        .sort((a: any, b: any) => {
          const aTime = a.updated_at ?? 0
          const bTime = b.updated_at ?? 0
          // 降順（新しい順）でソート
          return bTime - aTime
        })
        .map((item: any) => item.video_id)
        .filter((id: any): id is number => typeof id === 'number')
      setVideoIds(ids)
    }
    setIsInitialized(true)
  }, [settings.watched_history])

  // URLからクエリパラメータを読み取る
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10)
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setPage(parsedPage)
      }
    }
  }, [])

  // 現在のページに対応する動画IDを取得
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedVideoIds = videoIds.slice(startIndex, endIndex)

  // 動画データを取得
  const { data, isLoading } = useVideosQuery(
    paginatedVideoIds.length > 0 ? { ids: paginatedVideoIds } : undefined,
    { enabled: isInitialized && paginatedVideoIds.length > 0 }
  )

  const videos = ((data as any)?.data || []).sort((a: any, b: any) => {
    // watched_history から各動画のupdated_atを取得
    const aHistory = settings.watched_history?.find((item: any) => item.video_id === a.id)
    const bHistory = settings.watched_history?.find((item: any) => item.video_id === b.id)
    
    const aTime = aHistory?.updated_at ?? 0
    const bTime = bHistory?.updated_at ?? 0
    
    // 降順（新しい順）でソート
    return bTime - aTime
  })
  const total = videoIds.length
  const totalPages = Math.ceil(total / itemsPerPage)

  // ページ変更時にURLを更新
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('page', newPage.toString())
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb
          items={[{ label: 'ホーム', href: '/' }, { label: '視聴履歴' }]}
        />

        {!isInitialized || isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end gap-3">
              <h2 className="text-2xl font-bold">視聴履歴</h2>
              <p className="text-xs text-muted-foreground">0件</p>
            </div>
            <div className="flex-1 bg-[#2f221f] rounded-sm p-4">
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
                  <h3 className="font-semibold">視聴履歴はありません</h3>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        ) : (
          <VideoList
            title="視聴履歴"
            videos={videos}
            total={total}
            totalPages={totalPages}
            page={page}
            isLoading={isLoading}
            hideHeader={false}
            hideSort={true}
            hidePagination={false}
            showEmptyMessage={false}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </RootLayout>
  )
}
