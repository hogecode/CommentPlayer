'use client'

import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export default function CapturesPage() {
  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{ label: 'キャプチャ' }]} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">キャプチャ</h1>
          <p className="text-muted-foreground">このページはまだ実装されていません</p>
        </div>
      </div>
    </RootLayout>
  )
}
