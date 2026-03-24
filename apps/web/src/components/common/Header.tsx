'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'
import { useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface HeaderProps {
  children?: ReactNode
}

/**
 * ヘッダーコンポーネント
 * ロゴ、スロット、検索ボックスを含むヘッダー
 */
export function Header({ children }: HeaderProps) {
  const location = useLocation()
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')


  // 初期化：検索ページにいる場合は検索クエリを復元
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (location.pathname.endsWith('/search') && searchParams.has('query')) {
      const query = searchParams.get('query')
      if (query) {
        setSearchQuery(decodeURIComponent(query))
      }
    }
  }, [location.pathname])

  
  // キーボードイベント処理（Enter キーで検索）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      doSearch()
    }
  }

  // 検索を実行
  const doSearch = () => {
    if (searchQuery.trim()) {
      const searchPath = "/videos/search"
      const queryString = encodeURIComponent(searchQuery.trim())
      window.location.href = `${searchPath}?query=${queryString}`
    }
  }

  // 検索ボックスを表示するかどうか
  const showSearchInput = (() => {
    const path = location.pathname
    return !path.startsWith('/captures') &&
      !path.startsWith('/settings') &&
      !path.startsWith('/login') &&
      !path.startsWith('/register')
  })()

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center w-full h-16 px-4 bg-blue-300 z-40">
      {/* ロゴ */}
      <a
        href="/videos"
        className="flex items-center py-3 px-2 rounded-lg hover:bg-accent transition-colors"
      >
        <img
          src="/assets/images/logo.svg"
          height={21}
          alt="CommeVideo Logo"
          className="block"
        />
      </a>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* スロット（スタイルコントロール等） */}
      {children && <div className="flex items-center">{children}</div>}

      {/* 検索ボックス */}
      {showSearchInput && (
        <div className="relative flex items-center ml-4">
          <input
            ref={searchInputRef}
            type="search"
            placeholder={"録画番組を検索..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-56 h-11 px-3 pr-10 rounded-md border border-input bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            enterKeyHint="search"
          />
          <button
            onClick={doSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center p-1 rounded hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
            aria-label="検索実行"
          >
            <Search size={20} />
          </button>
        </div>
      )}
    </header>
  )
}
