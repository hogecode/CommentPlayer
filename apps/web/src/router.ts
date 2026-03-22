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

// ページ定義を配列でまとめる
const pages: { path: string; component: any }[] = [
  { path: '/', component: HomePage },
  { path: '/videos/$id', component: VideoPage },
]

// 配列から Route インスタンスを生成して一括追加
const routeTree = rootRoute.addChildren(
  pages.map(p => new Route({ getParentRoute: () => rootRoute, ...p }))
)
// ルータを作成
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
