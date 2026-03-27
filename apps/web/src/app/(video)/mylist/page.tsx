'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export default function MyListPage() {
  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{label: 'ホーム', href: '/'},{ label: 'マイリスト' }]} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">マイリスト</h1>
          <p className="text-muted-foreground">このページはまだ実装されていません</p>
        </div>
      </div>
    </RootLayout>
  )
}
