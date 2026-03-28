'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { CaptureList } from '@/components/capture/CaptureList'
import { useCapturesQuery } from '@/services/useCapturesQuery'
import { useEffect, useState } from 'react'

export default function CapturesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(12)

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
  }, [])

  // キャプチャ一覧を取得
  const { data, isLoading } = useCapturesQuery({
    page,
    limit,
  })

  const captures = (data as any)?.data || []
  const total = (data as any)?.pagination?.total || 0
  const totalPages = (data as any)?.pagination?.total_pages || 0

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
        <PageBreadcrumb items={[{ label: 'ホーム', href: '/' }, { label: 'キャプチャ' }]} />
        <CaptureList
          title="キャプチャ"
          captures={captures}
          total={total}
          totalPages={totalPages}
          page={page}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </RootLayout>
  )
}
