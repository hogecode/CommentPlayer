'use client'

import { Button } from '@/components/ui/button'
import { RootLayout } from '@/components/common/RootLayout'
import { VideoList } from '@/components/video/VideoList'
import { useVideosQuery } from '@/services/useVideosQuery'
import { useState } from 'react'

export default function HomePage() {
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // ビデオ一覧を取得
  const { data, isLoading } = useVideosQuery({
    page,
    limit: 30,
    sort: 'created_at',
    order: sortOrder,
  })

  const videos = (data as any)?.data || []
  const total = (data as any)?.pagination?.total || 0

  return (
    <RootLayout headerChildren={<Button variant="outline">ログイン</Button>}>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <VideoList
          title="動画一覧"
          videos={videos}
          total={total}
          page={page}
          sortOrder={sortOrder}
          isLoading={isLoading}
          onPageChange={setPage}
          onSortChange={setSortOrder}
        />
      </div>
    </RootLayout>
  )
}
