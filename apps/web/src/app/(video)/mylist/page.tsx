'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export default function MyListPage() {
  return (
    <RootLayout>
      <div className="page-container">
        <PageBreadcrumb items={[{label: 'ホーム', href: '/'},{ label: 'マイリスト' }]} />
        <div className="page-center-container">
          <h1 className="text-3xl font-bold mb-4">マイリスト</h1>
          <p className="text-muted-foreground">このページはまだ実装されていません</p>
        </div>
      </div>
    </RootLayout>
  )
}
