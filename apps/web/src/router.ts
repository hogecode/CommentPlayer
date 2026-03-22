import { RootRoute, Route, createRouter } from '@tanstack/react-router'
import RootLayout from './app/videos/layout'
import HomePage from './app/videos/index'
import VideoPage from './app/videos/[id]'

/**
 * ルート定義
 * ページ遷移時のスクロール挙動と View Transitions API は
 * usePageTransition フックで個別に管理する
 */

// ルートレイアウト
const rootRoute = new RootRoute({
  component: RootLayout,
})

// ホームページ
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// 動画ページ
const videoRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/videos/$id',
  component: VideoPage,
})

// ルートツリーを構築
const routeTree = rootRoute.addChildren([indexRoute, videoRoute])

// ルータを作成
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
