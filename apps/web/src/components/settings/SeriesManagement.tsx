'use client'

import { useEffect, useState, useMemo } from 'react'
import type { DtoSeriesResponse } from '@/generated'
import { useSeriesQuery, useResyncSeriesMutation } from '@/services/useSeries'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'

const columnHelper = createColumnHelper<DtoSeriesResponse>()

export function SeriesManagement() {
  const [mounted, setMounted] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])

  // マウント後のみクエリを実行
  const { data: seriesData, isLoading, error, isError } = useSeriesQuery({
    enabled: mounted,
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

  // TanStack Table のカラム定義
  const columns = useMemo(
    () => [
      columnHelper.accessor('series_name_file', {
        header: 'ファイル名',
        cell: (info) => (
          <code className="text-xs px-2 py-1 rounded">
            {info.getValue() ?? '-'}
          </code>
        ),
      }),
      columnHelper.accessor('syobocal_title_id', {
        header: 'Syobocal ID',
        cell: (info) => <span className="text-sm">{info.getValue() ?? '-'}</span>,
      }),
      columnHelper.accessor('syobocal_title_name', {
        header: 'シリーズ名',
        cell: (info) => (
          <span className="text-sm">{info.getValue() ?? '-'}</span>
        ),
      }),
    ],
    []
  )

  // テーブルインスタンスの作成
  const table = useReactTable({
    data: series,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleResync = async () => {
    try {
      await resyncMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to resync series:', error)
    }
  }

  const getSortIcon = (columnId: string) => {
    const sorting_state = table.getState().sorting
    const isSorted = sorting_state.find((sort) => sort.id === columnId)
    if (!isSorted) return '↕'
    return isSorted.desc ? '↓' : '↑'
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
            <p className="text-sm text-destructive">
              シリーズ情報の取得に失敗しました
            </p>
          </div>
        ) : series.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <p className="text-muted-foreground">
              シリーズが登録されていません
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="w-1/3 cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : typeof header.column.columnDef.header === 'string'
                            ? header.column.columnDef.header
                            : ''}
                        <span className="text-xs text-muted-foreground font-normal">
                          {getSortIcon(header.id)}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'series_name_file'
                          ? 'break-all'
                          : cell.column.id === 'syobocal_title_name'
                            ? 'break-all'
                            : ''
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
