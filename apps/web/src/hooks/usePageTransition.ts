import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * ページ遷移時の動作を管理するカスタムフック
 * - ページ遷移時のスクロール位置の管理
 */
export function usePageTransition(options?: {
  noTransitionRoutes?: string[]
}) {
  const location = useLocation()

  useEffect(() => {
    // ページ遷移時にスクロール位置を先頭にリセット
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])
}
