import { Outlet } from '@tanstack/react-router'
import { usePageTransition } from '@/hooks/usePageTransition'

/**
 * ルートレイアウト
 * ページ遷移時のスクロール挙動と View Transitions API を管理
 */
export default function RootLayout() {
  // ページ遷移時のアニメーションとスクロール挙動を設定
  usePageTransition({
    noTransitionRoutes: ['/videos/'],
  })

  return <Outlet />
}
