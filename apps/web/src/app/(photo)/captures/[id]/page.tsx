'use client'

import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { config } from '@/lib/config'
import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { useGetCaptureByIdQuery, useGetAdjacentCapture } from '@/services/useCaptures'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * キャプチャ詳細ページ
 *
 * URLパラメータからキャプチャIDを取得し、キャプチャデータを表示
 * 前後のナビゲーションボタンを表示
 */
export default function CapturePage() {
  const { id: captureIdParam } = useParams({ from: '/captures/$id' })
  const navigate = useNavigate({ from: '/captures/$id' })
  const [loadingNext, setLoadingNext] = useState(false)

  // IDが有効な数値かチェック
  const captureId = captureIdParam ? parseInt(captureIdParam as string, 10) : null
  const isValidId = captureId !== null && !isNaN(captureId) && captureId > 0

  // 無効なIDの場合はエラー表示
  if (!isValidId) {
    return (
      <RootLayout>
        <div className="container mx-auto pt-24 px-4 pb-16">
          <div className="text-red-500 text-xl">キャプチャIDが無効です</div>
        </div>
      </RootLayout>
    )
  }

  const { data: captureData, isLoading, error } = useGetCaptureByIdQuery(captureId)
  const { previousCapture, nextCapture, canLoadMore, loadNextPage } = useGetAdjacentCapture(captureId)

  const handleNextClick = async () => {
    // キャッシュに次のキャプチャがある場合
    if (nextCapture) {
      navigate({ to: '/captures/$id', params: { id: nextCapture.id!.toString() } })
      return
    }

    // キャッシュにない場合、次のページを読み込む
    if (canLoadMore) {
      setLoadingNext(true)
      try {
        const loadedCapture = await loadNextPage()
        if (loadedCapture) {
          navigate({ to: '/captures/$id', params: { id: loadedCapture.id!.toString() } })
        }
      } finally {
        setLoadingNext(false)
      }
    }
  }

  const handlePreviousClick = () => {
    if (previousCapture) {
      navigate({ to: '/captures/$id', params: { id: previousCapture.id!.toString() } })
    }
  }

  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto pt-24 px-4 pb-16">
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      </RootLayout>
    )
  }

  if (error || !captureData) {
    return (
      <RootLayout>
        <div className="container mx-auto pt-24 px-4 pb-16">
          <div className="text-red-500 text-xl">キャプチャの読み込みに失敗しました</div>
        </div>
      </RootLayout>
    )
  }

  const imageSrc = `${config.apiBaseUrl}/captures/${captureData.filename}`
  const createdDate = captureData.created_at
    ? new Date(captureData.created_at).toLocaleDateString('ja-JP')
    : 'Unknown'

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'キャプチャ', href: '/captures' },
            { label: captureData.filename || `Capture ${captureId}` },
          ]}
        />

        <div className="flex flex-col w-full gap-6 mt-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">キャプチャ詳細</h2>
          </div>

          {/* 画像表示エリア */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden bg-muted">
              <img
                src={imageSrc}
                alt={captureData.filename || `Capture ${captureId}`}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* メタデータ */}
            <div className="w-full max-w-4xl">
              <p className="text-sm text-muted-foreground break-words">
                ファイル: <span className="font-mono">{captureData.filename}</span>
              </p>
              <p className="text-sm text-muted-foreground">作成日時: {createdDate}</p>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="default"
              size="lg"
              onClick={handlePreviousClick}
              disabled={!previousCapture}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              前へ
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handleNextClick}
              disabled={!nextCapture && !canLoadMore}
              className="gap-2"
            >
              次へ
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* ローディング状態 */}
          {loadingNext && (
            <div className="text-center text-sm text-muted-foreground">
              次のページを読み込み中...
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  )
}
