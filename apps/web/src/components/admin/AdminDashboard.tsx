'use client'

import { SeriesStatsTable } from './SeriesStatsTable'
import { CalendarView } from './CalendarView'
import { MonthlySummary } from './MonthlySummary'

interface AdminDashboardProps {
  stats: any
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div className='grid grid-cols-1 gap-6'>
      {/* 月間サマリー */}
      {stats?.monthly_summary && (
        <MonthlySummary summary={stats.monthly_summary} />
      )}

      {/* カレンダービュー */}
      {stats?.daily_views && (
        <CalendarView
          data={stats.daily_views}
          year={stats.year}
          month={stats.month}
        />
      )}

      {/* シリーズ別再生数テーブル */}
      {stats?.series_views && stats.series_views.length > 0 && (
        <SeriesStatsTable data={stats.series_views} />
      )}
    </div>
  )
}
