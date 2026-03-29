'use client'

import { useEffect, useState, useMemo } from 'react'
import type { DtoSeriesResponse } from '@/generated'
import { useSeriesQuery, useResyncSeriesMutation } from '@/services/useSeries'
import { useSearchSyobocalQuery, useSaveSyobocalTitleMutation } from '@/services/useSyobocal'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeriesRowState {
  [key: number]: {
    searchQuery: string
    selectedTid?: string
    selectedTitle?: string
    isOpen: boolean
    isSaving: boolean
  }
}

const columnHelper = createColumnHelper<DtoSeriesResponse>()

export function SeriesManagement() {
  const [mounted, setMounted] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowStates, setRowStates] = useState<SeriesRowState>({})

  // マウント後のみクエリを実行
  const { data: seriesData, isLoading, error, isError } = useSeriesQuery({
    enabled: mounted,
  })

  const resyncMutation = useResyncSeriesMutation()
  const saveMutation = useSaveSyobocalTitleMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const series: DtoSeriesResponse[] = seriesData?.series ?? []

  // エラーをログに出力
  if (error) {
    console.error('Failed to fetch series:', error)
  }

  // 行の状態を初期化
  useEffect(() => {
    const newStates: SeriesRowState = {}
    series.forEach((s) => {
      if (s.id && !rowStates[s.id]) {
        newStates[s.id] = {
          searchQuery: s.series_name_file || '',
          selectedTid: s.syobocal_title_id?.toString(),
          selectedTitle: s.syobocal_title_name || undefined,
          isOpen: false,
          isSaving: false,
        }
      }
    })
    if (Object.keys(newStates).length > 0) {
      setRowStates((prev) => ({ ...prev, ...newStates }))
    }
  }, [series])

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
        header: 'SID',
        cell: (info) => <span className="text-xs">{info.getValue() ?? '-'}</span>,
      }),
      columnHelper.accessor('syobocal_title_name', {
        header: 'シリーズ名',
        cell: (info) => (
          <span className="text-xs truncate max-w-5" title={info.getValue() ?? ''}>
            {info.getValue() ?? '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'syobocal-search',
        header: 'Syobocal 検索',
        cell: (info) => 
          info.row.original.id ? (
            <SyobocalSearchCell
              rowId={info.row.original.id}
              seriesNameFile={info.row.original.series_name_file ?? null}
              rowStates={rowStates}
              setRowStates={setRowStates}
              saveMutation={saveMutation}
            />
          ) : null,
      }),
    ],
    [rowStates, saveMutation]
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
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="cursor-pointer text-xs select-none bg-muted/50 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : typeof header.column.columnDef.header === 'string'
                              ? header.column.columnDef.header
                              : ''}
                          {header.id !== 'syobocal-search' && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {getSortIcon(header.id)}
                            </span>
                          )}
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
                        className={cn(
                          cell.column.id === 'series_name_file' && 'max-w-12 break-all',
                          cell.column.id === 'syobocal_title_id' && 'max-w-10',
                          cell.column.id === 'syobocal_title_name' && 'max-w-30 truncate',
                          cell.column.id === 'syobocal-search' && ' truncate',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

// Syobocal 検索セルコンポーネント
interface SyobocalSearchCellProps {
  rowId: number
  seriesNameFile: string | null
  rowStates: SeriesRowState
  setRowStates: React.Dispatch<React.SetStateAction<SeriesRowState>>
  saveMutation: any
}

function SyobocalSearchCell({
  rowId,
  seriesNameFile,
  rowStates,
  setRowStates,
  saveMutation,
}: SyobocalSearchCellProps) {
  const rowState = rowStates[rowId] || {
    searchQuery: seriesNameFile || '',
    selectedTid: undefined,
    selectedTitle: undefined,
    isOpen: false,
    isSaving: false,
  }

  const { data: searchResults, isLoading: isSearching } = useSearchSyobocalQuery(
    rowState.searchQuery
  )

  const titles = searchResults?.titles ?? []
  
  // デバッグ
  if (searchResults) {
    console.log('[Syobocal Debug]', {
      searchQuery: rowState.searchQuery,
      searchResults,
      titles,
      isSearching,
    })
  }

  const handleSearch = (value: string) => {
    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        searchQuery: value,
        isOpen: true,
      },
    }))
  }

  const handleSelect = (tid: string, title: string) => {
    setRowStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        selectedTid: tid,
        selectedTitle: title,
        isOpen: false,
      },
    }))
  }

  const handleSave = async () => {
    if (!rowState.selectedTid || !rowState.selectedTitle) return

    setRowStates((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], isSaving: true },
    }))

    try {
      await saveMutation.mutateAsync({
        tid: rowState.selectedTid,
        title: rowState.selectedTitle,
        series_id: rowId,
      })
    } finally {
      setRowStates((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], isSaving: false },
      }))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover
        open={rowState.isOpen}
        onOpenChange={(open) => {
          setRowStates((prev) => ({
            ...prev,
            [rowId]: { ...prev[rowId], isOpen: open },
          }));
        }}
      >
        <PopoverTrigger asChild className="flex align-between">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={rowState.isOpen}
          >
            {/* タイトル*/}
            <span className="w-25 text-black text-xs flex justify-start truncate">
              {rowState.selectedTitle ||
                rowState.searchQuery ||
                "タイトルを検索..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {/* オートフィル - Syobocal タイトル検索 */}
        <PopoverContent className="p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="タイトルを検索..."
              value={rowState.searchQuery}
              onValueChange={handleSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isSearching ? (
                  <div className="flex justify-center py-2">
                    <Spinner className="h-4 w-4" />
                  </div>
                ) : titles.length === 0 ? (
                  "タイトルが見つかりません"
                ) : null}
              </CommandEmpty>
              {titles.length > 0 && (
                <CommandGroup>
                  {titles.map((title) => (
                    <CommandItem
                      key={title.tid}
                      value={title.tid as string}
                      onSelect={() =>
                        handleSelect(title.tid as string, title.title as string)
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          rowState.selectedTid === title.tid
                            ? "opacity-100"
                            : "opacity-70",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm">{title.title}</span>
                        {title.short_title && (
                          <span className="text-xs">{title.short_title}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={
          !rowState.selectedTid || rowState.isSaving || saveMutation.isPending
        }
        className="bg-green-600 hover:bg-green-700" text-xs
      >
        {rowState.isSaving ? (
          <>
            <Spinner className="mr-1 h-3 w-3" />
            保存中
          </>
        ) : (
          "保存"
        )}
      </Button>
    </div>
  );
}
