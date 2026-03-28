import { RootRoute, Route, createRouter } from '@tanstack/react-router'
import RootLayout from '@/app/layout'
import HomePage from '@/app/(video)/videos/page'
import SearchPage from '@/app/(video)/videos/search/page'
import VideoPage from '@/app/(video)/videos/[id]/page'
import CapturesPage from '@/app/(photo)/captures/page'
import MyListPage from '@/app/(video)/mylist/page'
import WatchedHistoryPage from '@/app/(video)/watched-history/page'
import SettingsPage from '@/app/(settings)/settings/page'
import NotFoundPage from '@/app/not-found'
import RedirectToVideos from '@/app/page'
import LoginPage from '@/app/(auth)/login/page'
import RegisterPage from '@/app/(auth)/register/page'
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
// 重要: /videos/searchは/videos/$idより前に定義する必要があります
// ルートの優先度は定義順序で決まるため、より具体的なパスを先に定義します
const pages: { path: string; component: any }[] = [
  { path: '/videos', component: HomePage },
  { path: '/videos/search', component: SearchPage },
  { path: '/videos/$id', component: VideoPage },
  { path: '/', component: RedirectToVideos }, 
  { path: '/captures', component: CapturesPage },
  { path: '/mylist', component: MyListPage },
  { path: '/watched-history', component: WatchedHistoryPage },
  { path: '/settings', component: SettingsPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '*', component: NotFoundPage },
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
