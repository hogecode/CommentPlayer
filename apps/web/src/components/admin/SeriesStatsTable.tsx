'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SeriesStatsTableProps {
  data: Array<{
    series_id: number
    series_name: string
    total_views: number
    video_count: number
  }>
}

export function SeriesStatsTable({ data }: SeriesStatsTableProps) {
  return (
    <Card className='bg-black/90 text-white max-w-xl'>
      <CardHeader>
        <CardTitle>シリーズ別再生数</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader className='bg-gray-800'>
              <TableRow>
                <TableHead>シリーズ名</TableHead>
                <TableHead className='text-right'>再生数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((series) => (
                <TableRow key={series.series_id}>
                  <TableCell className='font-medium'>
                    {series.series_name}
                  </TableCell>
                  <TableCell className='text-right'>
                    {series.total_views.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
