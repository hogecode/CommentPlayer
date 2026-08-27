'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Play, Film } from 'lucide-react'

interface MonthlySummaryProps {
  summary: {
    days_with_views: number
    total_views_month: number
    unique_videos_watched: number
  }
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {/* 再生数 */}
      <Card className='bg-black/90 text-white'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>月間再生数</CardTitle>
          <Eye className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{summary.total_views_month}</div>
        </CardContent>
      </Card>

      {/* ユニーク動画数 */}
      <Card className='bg-black/90 text-white'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>視聴した動画数</CardTitle>
          <Film className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {summary.unique_videos_watched}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
