'use client'

import { useState } from 'react'
import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { useAdminStatsQuery } from '@/services/useAdminStats'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data, isLoading, error } = useAdminStatsQuery(year, month)

  // エラーログを表示
  if (error) {
    console.error('[AdminPage] Query error:', error)
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
  }

  const monthName = new Date(year, month - 1).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <RootLayout>
      <div className='container mx-auto pt-24 px-4 pb-16'>
        <PageBreadcrumb
          items={[{ label: 'ホーム', href: '/' }, { label: '管理画面' }]}
        />

        <div className='flex flex-col gap-6 max-w-6xl'>
          {/* ヘッダー */}
          <div>
            <h1 className='text-3xl font-bold mb-2'>管理画面</h1>
            <p className='text-muted-foreground'>
              視聴統計とアナリティクス情報を確認できます
            </p>
          </div>

          {/* 日付操作 */}
          <div className='flex items-center gap-4 p-4 border rounded-lg'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevMonth}
              className='p-2 bg-black/90'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <div className='flex-1'>
              <h2 className='text-lg font-semibold text-center'>{monthName}</h2>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextMonth}
              className='p-2 bg-black/90'
            >
              <ChevronRight className='w-4 h-4' />
            </Button>

            <div className='border-l' />

            <Button
              variant='outline'
              size='sm'
              onClick={handleToday}
              className='p-2 bg-black/90'
            >
              今月
            </Button>
          </div>

          {/* ダッシュボード */}
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <p className='text-muted-foreground'>読み込み中...</p>
            </div>
          ) : error ? (
            <div className='flex flex-col justify-center items-center h-64 gap-2'>
              <p className='text-red-500'>エラーが発生しました</p>
              <p className='text-sm text-muted-foreground'>
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          ) : data ? (
            <AdminDashboard stats={data} />
          ) : null}
        </div>
      </div>
    </RootLayout>
  )
}
