'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function CatchAllNotFound() {
  const navigate = useNavigate()

  return (
    <RootLayout>
      <div className="container mx-auto pt-44 px-4 pb-16">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-2xl font-semibold mb-2">ページが見つかりません</p>
          <p className="text-muted-foreground mb-8">申し訳ございません。お探しのページは存在しません。</p>
          <Button 
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </RootLayout>
  )
}