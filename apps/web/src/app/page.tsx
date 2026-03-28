
import { Navigate } from '@tanstack/react-router'
import { RootLayout } from '@/components/common/RootLayout'
import { PageBreadcrumb } from '@/components/common/PageBreadcrumb'

export default function RedirectToVideos() {
  return (
    <RootLayout>
      <div className="container mx-auto pt-24 px-4 pb-16">
        <PageBreadcrumb items={[{label: 'ホーム', href: '/'}]} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-muted-foreground">このページはまだ実装されていません</p>
        </div>
      </div>
    </RootLayout>
  )
}