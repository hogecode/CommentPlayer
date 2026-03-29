'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { FolderManagement } from '@/components/settings/FolderManagement'
import { MutedKeywordsSettings } from '@/components/settings/MutedKeywordsSettings'
import { CommentDisplaySettings } from '@/components/settings/CommentDisplaySettings'
import { SeriesManagement } from '@/components/settings/SeriesManagement'

export default function SettingsPage() {

  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{label: 'ホーム', href: '/'},{ label: '設定' }]} />
        <div className="flex flex-col gap-8 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold mb-2">設定</h1>
            <p className="text-muted-foreground">アプリケーションの設定を管理します</p>
          </div>

          {/* フォルダ管理セクション */}
          <section className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">監視対象フォルダ管理</h3>
            <FolderManagement />
          </section>

          {/* コメント表示設定セクション */}
          <section className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">コメント表示設定</h3>
            <CommentDisplaySettings />
          </section>

          {/* NGワード設定セクション */}
          <section className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">コメントフィルタリング設定</h3>
            <MutedKeywordsSettings />
          </section>

          {/* シリーズ管理セクション */}
          <section className="border rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">シリーズ管理</h3>
            <SeriesManagement />
          </section>
        </div>
      </div>
    </RootLayout>
  )
}
