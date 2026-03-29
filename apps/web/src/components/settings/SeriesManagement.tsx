'use client'

import { useEffect, useState } from 'react'
import type { DtoSeriesResponse } from '@/generated'
import { useSeriesQuery, useResyncSeriesMutation } from '@/services/useSeries'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'

export function SeriesManagement() {
  const [mounted, setMounted] = useState(false)
  
  // マウント後のみクエリを実行
  const { data: seriesData, isLoading, error, isError } = useSeriesQuery({
    enabled: mounted
  })
  
  const resyncMutation = useResyncSeriesMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const series: DtoSeriesResponse[] = seriesData?.series ?? []

  // エラーをログに出力
  if (error) {
    console.error('Failed to fetch series:', error)
  }

  const handleResync = async () => {
    try {
      await resyncMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to resync series:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold mb-4">シリーズ一覧</h3>
        <Button
          onClick={handleResync}
          disabled={resyncMutation.isPending || isLoading}
          className="bg-primary whitespace-nowrap"
        >
          {resyncMutation.isPending ? (
            <>
              <Spinner className="mr-2 size-4" />
              再同期中...
            </>
          ) : (
            '再同期'
          )}
        </Button>
      </div>

      {/* シリーズ一覧 */}
      <div>
        {!mounted ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
            <p className="text-sm text-destructive">シリーズ情報の取得に失敗しました</p>
          </div>
        ) : series.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <p className="text-muted-foreground">シリーズが登録されていません</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">ファイル名</TableHead>
                <TableHead className="w-1/3">Syobocal ID</TableHead>
                <TableHead className="w-1/3">シリーズ名</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((serie) => (
                <TableRow key={serie.id}>
                  <TableCell className="break-all">
                    <code className="text-xs px-2 py-1 rounded">
                      {serie.series_name_file ?? '-'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {serie.syobocal_title_id ?? '-'}
                    </span>
                  </TableCell>
                  <TableCell className="break-all">
                    <span className="text-sm">
                      {serie.syobocal_title_name ?? '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
