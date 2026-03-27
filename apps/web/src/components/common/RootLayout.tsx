'use client'

import { ReactNode } from 'react'
import { Header } from '@/components/common/Header'
import { Separator } from '@/components/ui/separator'
import Sidebar from './Sidebar'

interface RootLayoutProps {
  children: ReactNode
  headerChildren?: ReactNode
}

/**
 * 共通レイアウトコンポーネント
 * 
 * Header、Sidebar、メインコンテンツ、フッターの共通レイアウトを管理
 * children: ページのメインコンテンツ
 * headerChildren: ヘッダーに挿入する要素（ボタンなど）
 */
export function RootLayout({ children, headerChildren }: RootLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダーコンポーネント */}
      <Header>{headerChildren}</Header>
      {/* メインレイアウト（Sidebar + Content） */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebarコンポーネント */}
        <Sidebar />

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
