'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'
import { FolderManagement } from '@/components/settings/FolderManagement'

export default function SettingsPage() {
  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{ label: '設定' }]} />
        <div className="flex flex-col gap-8 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold mb-2">設定</h1>
            <p className="text-muted-foreground">アプリケーションの設定を管理します</p>
          </div>

          {/* フォルダ管理セクション */}
          <section className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">監視対象フォルダ管理</h2>
            <FolderManagement />
          </section>
        </div>
      </div>
    </RootLayout>
  )
}
