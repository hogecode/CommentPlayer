'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { useCapturesQuery } from '@/services/useCapturesQuery'
import { useState } from 'react'

export default function CapturesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(12)

  const { data, isLoading, isError, error } = useCapturesQuery({
    page,
    limit,
  })

  const captures = data?.data || []
  const pagination = data?.pagination

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{label: 'ホーム', href: '/'}, { label: 'キャプチャ' }]} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">キャプチャ</h1>
          <p className="text-muted-foreground">撮影したキャプチャ画像を表示しています</p>
        </div>

        {isError && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
            <p>エラーが発生しました: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        ) : captures.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground mb-2">キャプチャがありません</p>
          </div>
        ) : (
          <>
            {/* Grid of captures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {captures.map((capture) => (
                <div
                  key={capture.id}
                  className="group relative bg-muted rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow duration-200"
                >
                    <img
                      src={`http://localhost:8000/captures/${capture.filename}`}
                      alt={capture.filename || `Capture ${capture.id}`}
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  {/* Overlay with info on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-medium truncate">{capture.filename}</p>
                    {capture.created_at && (
                      <p className="text-white/70 text-xs">
                        {new Date(capture.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages && pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-input hover:bg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(pagination.total_pages!, page + 1))}
                  disabled={page === pagination.total_pages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </RootLayout>
  )
}
