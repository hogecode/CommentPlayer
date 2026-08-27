'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

interface CalendarViewProps {
  data: Array<{
    date: string
    watch_count: number
  }>
  year: number
  month: number
}

export function CalendarView({ data, year, month }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // データをマップに変換（日付をキーとして）
  const dataMap = new Map(data.map((item) => [item.date, item.watch_count]))

  // カレンダーの日付配列を生成
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // カレンダーのセルを生成
  const calendarDays = []
  
  // 前月の末日を埋める
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(year, month - 1, -i).getDate()
    calendarDays.push({ day, isCurrentMonth: false, date: null, views: 0 })
  }

  // 当月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const views = dataMap.get(dateStr) || 0
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: dateStr,
      views,
    })
  }

  // 翌月の日付を埋める
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({ day, isCurrentMonth: false, date: null, views: 0 })
  }

  // 日付ごとの背景色を計算
  const getBackgroundColor = (views: number) => {
    if (views === 0) return 'bg-card'
    if (views > 20) return 'bg-blue-600 text-white'
    if (views > 10) return 'bg-blue-400 text-white'
    if (views > 5) return 'bg-blue-200 text-gray-900'
    return 'bg-blue-100 text-gray-900'
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <Card className='bg-black/90 text-white/90'>
      <CardHeader>
        <CardTitle>カレンダービュー（視聴履歴）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* カレンダー */}
          <div>
            {/* 曜日ヘッダー */}
            <div className='grid grid-cols-7 gap-1 mb-2'>
              {weekDays.map((day) => (
                <div key={day} className='text-center font-semibold text-sm p-2'>
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーセル */}
            <div className='grid grid-cols-7 gap-1'>
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => day.date && setSelectedDate(day.date)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded text-sm p-1
                    cursor-pointer transition-all
                    text-black
                    ${day.isCurrentMonth ? getBackgroundColor(day.views) : 'bg-muted text-muted-foreground'}
                    ${selectedDate === day.date ? 'ring-2 ring-primary' : ''}
                    ${day.views > 0 && day.isCurrentMonth ? 'hover:opacity-80' : ''}
                  `}
                >
                  <div className='font-semibold'>{day.day}</div>
                  {day.views > 0 && day.isCurrentMonth && (
                    <div className='text-xs'>{day.views}件</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 選択日の詳細 */}
          {selectedDate && (
            <div className='p-3 bg-muted rounded text-black'>
              <p className='text-sm font-medium'>{selectedDate}</p>
              <p className='text-sm'>
                視聴数: {dataMap.get(selectedDate) || 0}件
              </p>
            </div>
          )}

          {/* 凡例 */}
          <div className='text-xs text-muted-foreground space-y-1'>
            <p className='font-semibold'>色の強さ = 視聴数</p>
            <div className='flex gap-2 flex-wrap'>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-4 bg-blue-100' />
                <span>少ない</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-4 bg-blue-400' />
                <span>中程度</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-4 bg-blue-600' />
                <span>多い</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
