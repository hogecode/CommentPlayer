'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { VideoList } from '@/components/video/VideoList'
import { useSearchVideosQuery } from '@/services/useVideosQuery'
import { useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export default function SearchPage() {
  const location = useLocation()
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  // URLからクエリパラメータを読み取る
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    // qパラメータを読み取る（検索キーワード）
    const qParam = searchParams.get('q')
    if (qParam) {
      setSearchQuery(qParam)
    }

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

  // ビデオ検索クエリを実行（検索キーワード、ページ、ソート順序を指定）
  const { data, isLoading } = useSearchVideosQuery(searchQuery, {
    page,
    limit: 20,
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
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[
          { label: '動画', href: '/videos' },
          { label: '検索' }
        ]} />
        <VideoList
          title={searchQuery ? `「${searchQuery}」の検索結果` : '検索'}
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
