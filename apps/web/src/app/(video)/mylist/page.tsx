'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { VideoList } from '@/components/video/VideoList'
import { useVideosQuery } from '@/services/useVideos'
import { useSettingsStore } from '@/stores/settings-store'
import { useEffect, useState } from 'react'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '@/components/ui/empty'

export default function MyListPage() {
  const settings = useSettingsStore((state) => state.settings)
  const [videoIds, setVideoIds] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 設定ストアからマイリストの動画IDを抽出
  useEffect(() => {
    if (settings.mylist && settings.mylist.length > 0) {
      const ids = settings.mylist
        .map((item: any) => item.id)
        .filter((id: any): id is number => typeof id === 'number')
      setVideoIds(ids)
    }
    setIsInitialized(true)
  }, [settings.mylist])

  // 動画データを取得
  const { data, isLoading } = useVideosQuery(
    videoIds.length > 0 ? { ids: videoIds } : undefined,
    { enabled: isInitialized && videoIds.length > 0 }
  )

  const videos = (data as any)?.data || []
  const total = videoIds.length

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb
          items={[{ label: 'ホーム', href: '/' }, { label: 'マイリスト' }]}
        />

        {!isInitialized || isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end gap-3">
              <h2 className="text-2xl font-bold">マイリスト</h2>
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
                  <h3 className="font-semibold">マイリストは空です</h3>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        ) : (
          <VideoList
            title="マイリスト"
            videos={videos}
            total={total}
            isLoading={isLoading}
            hideHeader={false}
            hideSort={true}
            hidePagination={true}
            showEmptyMessage={false}
          />
        )}
      </div>
    </RootLayout>
  )
}
