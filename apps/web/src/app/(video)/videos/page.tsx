'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { VideoList } from '@/components/video/VideoList'
import { useVideosQuery, useVideoYearsQuery } from '@/services/useVideosQuery'
import { useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const location = useLocation()
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

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

    // yearパラメータを読み取る
    const yearParam = searchParams.get('year')
    if (yearParam) {
      const parsedYear = parseInt(yearParam, 10)
      if (!isNaN(parsedYear) && parsedYear > 0) {
        setSelectedYear(parsedYear)
      }
    }
  }, [location.search])

  // 年一覧を取得
  const { data: yearData } = useVideoYearsQuery()
  const yearList = (yearData as any) || []

  // ビデオ一覧を取得（年フィルタリング対応）
  const { data, isLoading } = useVideosQuery({
    page,
    limit: 20,
    sort: 'jikkyo_date',
    order: sortOrder,
    year: selectedYear || undefined
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

  // 年フィルター変更時にURLを更新
  const handleYearChange = (newYear: number | null) => {
    setSelectedYear(newYear)
    setPage(1) // 年フィルター変更時はページを1にリセット
    const searchParams = new URLSearchParams(window.location.search)
    if (newYear) {
      searchParams.set('year', newYear.toString())
    } else {
      searchParams.delete('year')
    }
    searchParams.set('page', '1')
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{ label: '動画一覧' }]} />
        <VideoList
          title="動画一覧"
          videos={videos}
          total={total}
          totalPages={totalPages}
          page={page}
          sortOrder={sortOrder}
          year={selectedYear}
          yearList={yearList}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onYearChange={handleYearChange}
        />
      </div>
    </RootLayout>
  )
}
