'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useState } from 'react'

// 動画視聴詳細情報
interface VideoView {
  video_id: number
  file_name: string
  episode: string
  subtitle: string
  series_name: string
  view_count: number
}

// 日付ごとの再生数（詳細データ付き）
interface DailyViewData {
  date: string
  view_count: number
  videos: VideoView[]
}

interface CalendarViewProps {
  data: DailyViewData[]
  year: number
  month: number
}

export function CalendarView({ data, year, month }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // データをマップに変換（日付をキーとして詳細情報を保持）
  const dataMap = new Map(data.map((item) => [item.date, item]))

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
    const dailyData = dataMap.get(dateStr)
    const views = dailyData?.view_count || 0
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

    // viewsを基にTailwindの色クラスを動的に選択
    // bg-blue-100（少ない） → bg-blue-900（多い）
    if (views < 5) return 'bg-blue-100 text-gray-900'
    if (views < 10) return 'bg-blue-200 text-gray-900'
    if (views < 15) return 'bg-blue-300 text-gray-900'
    if (views < 20) return 'bg-blue-400 text-white'
    if (views < 25) return 'bg-blue-500 text-white'
    return 'bg-blue-600 text-white'
  }


  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <Card className="bg-black/90 text-white/90">
      <CardHeader>
        <CardTitle>カレンダービュー（視聴履歴）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* カレンダー */}
          <div>
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-2 max-w-[30rem]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーセル */}
            <div className="grid grid-cols-7 gap-1 max-w-[30rem]">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => day.date && setSelectedDate(day.date)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded text-sm p-1
                    cursor-pointer transition-all
                    text-black
                    ${day.isCurrentMonth ? getBackgroundColor(day.views) : "bg-muted text-muted-foreground"}
                    ${selectedDate === day.date ? "ring-2 ring-primary" : ""}
                    ${day.views > 0 && day.isCurrentMonth ? "hover:opacity-80" : ""}
                  `}
                >
                  <div className="font-semibold">{day.day}</div>
                  {/*{day.views > 0 && day.isCurrentMonth && (
                    <div className="text-xs">{day.views}件</div>
                  )}*/}
                </button>
              ))}
            </div>
          </div>

          {/* 選択日の詳細 */}
          {selectedDate && (
            <Accordion type="single" collapsible className=" max-w-[30rem] max-h-100 overflow-y-auto">
              <AccordionItem
                value={`date-${selectedDate}`}
                className="border border-gray-300 rounded bg-muted"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/80 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center justify-between w-full gap-4 text-black">
                    <p className="text-sm font-semibold">{selectedDate}</p>
                    <span className="text-sm text-gray-600">
                      総視聴数: {dataMap.get(selectedDate)?.view_count || 0}件
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 text-black border-t border-gray-300">
                  {/* 動画視聴履歴リスト */}
                  {dataMap.get(selectedDate)?.videos &&
                  dataMap.get(selectedDate)!.videos.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">
                        視聴した動画一覧 ({dataMap.get(selectedDate)!.videos.length}件)
                      </p>
                      <div>
                        {dataMap.get(selectedDate)!.videos.map((video) => (
                          <div
                            key={`${selectedDate}-${video.video_id}`}
                            className="border border-gray-300 rounded mb-2 bg-white/50"
                          >
                            <div className="px-1 py-1 hover:bg-white/70 [&[data-state=open]>svg]:rotate-180">
                              <div className="flex items-start justify-between w-full gap-2 pr-2">
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="text-xs text-gray-600 truncate">
                                    {video.series_name}
                                  </p>
                                  <div className="flex gap-2">
                                    <p className="text-xs font-medium truncate">
                                     #{video.episode}
                                    </p>
                                    {video.subtitle && (
                                      <p className="text-xs text-gray-700 truncate font-semibold">
                                        {video.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="shrink-0">
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                    {video.view_count}回
                                  </span>
                                </div>
                                 
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      この日は動画が視聴されていません
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* 凡例 */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">色の強さ = 視聴数</p>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-100" />
                <span>少ない</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-400" />
                <span>中程度</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-600" />
                <span>多い</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
