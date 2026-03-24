'use client'

import { ReactNode } from 'react'
import { Header } from '@/components/common/Header'
import { Separator } from '@/components/ui/separator'

interface RootLayoutProps {
  children: ReactNode
  headerChildren?: ReactNode
}

/**
 * 共通レイアウトコンポーネント
 * 
 * Header とそれ以降に追加されるサイドバーなどの共通レイアウトを管理
 * children: ページのメインコンテンツ
 * headerChildren: ヘッダーに挿入する要素（ボタンなど）
 */
export function RootLayout({ children, headerChildren }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダーコンポーネント */}
      <Header>{headerChildren}</Header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {children}
      </main>

      {/* フッター */}
      <footer className="mt-auto border-t">
        <Separator className="m-0" />
        <div className="bg-muted/30 text-muted-foreground py-6 text-center">
          <p className="text-sm">&copy; 2026 CommeVideo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
