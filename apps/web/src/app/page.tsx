'use client'

import { Button } from '@/components/ui/button'
import { RootLayout } from '@/components/common/RootLayout'
import { VideoList } from '@/components/video/VideoList'
import { useVideosQuery } from '@/services/useVideosQuery'
import { useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const location = useLocation()
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // URLからクエリパラメータを読み取る
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    
    // pageパラメータを読み取る
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10)
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setPage(parsedPage)
      }
    }
    
    // orderパラメータを読み取る
    const orderParam = searchParams.get('order')
    if (orderParam === 'asc' || orderParam === 'desc') {
      setSortOrder(orderParam)
    }
  }, [location.search])

  // ビデオ一覧を取得（?page=1&order=ascのようにクエリパラメータを付与してAPIからビデオ一覧を取得）
  const { data, isLoading } = useVideosQuery({
    page,
    limit: 20,
    sort: 'jikkyo_date',
    order: sortOrder,
  })

  const videos = (data as any)?.data || []
  const total = (data as any)?.pagination?.total || 0
  const totalPages = (data as any)?.pagination?.total_pages || 0

  // ページ変更時にURLを更新
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('page', newPage.toString())
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  // ソート順序変更時にURLを更新
  const handleSortChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder)
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('order', newOrder)
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  return (
    <RootLayout headerChildren={<Button variant="outline">ログイン</Button>}>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <VideoList
          title="動画一覧"
          videos={videos}
          total={total}
          totalPages={totalPages}
          page={page}
          sortOrder={sortOrder}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      </div>
    </RootLayout>
  )
}
