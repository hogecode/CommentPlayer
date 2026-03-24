"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Search, Download } from "lucide-react";
import { pwaInstallHandler } from "pwa-install-handler";

interface HeaderProps {
  children?: ReactNode;
}

/**
 * ヘッダーコンポーネント
 * ロゴ、スロット、検索ボックスを含むヘッダー
 */
export function Header({ children }: HeaderProps) {
  const location = useLocation();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isButtonDisplay, setIsButtonDisplay] = useState(false);

  // 初期化：検索ページにいる場合は検索クエリを復元
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (location.pathname.endsWith("/search") && searchParams.has("query")) {
      const query = searchParams.get("query");
      if (query) {
        setSearchQuery(decodeURIComponent(query));
      }
    }
  }, [location.pathname]);

  // PWAインストールボタンのリスナーをセットアップ
  useEffect(() => {
    const listener = (canInstall: boolean) => {
      console.log("[Header] PWAインストール状態変更:", canInstall);
      setIsButtonDisplay(canInstall);
    };
    pwaInstallHandler.addListener(listener);
    console.log("[Header] PWAリスナー登録完了");

    return () => {
      pwaInstallHandler.removeListener(listener);
    };
  }, []);

  // キーボードイベント処理（Enter キーで検索）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      doSearch();
    }
  };

  // 検索を実行
  const doSearch = () => {
    if (searchQuery.trim()) {
      const searchPath = "/videos/search";
      const queryString = encodeURIComponent(searchQuery.trim());
      window.location.href = `${searchPath}?q=${queryString}`;
    }
  };

  // 検索ボックスを表示するかどうか
  const showSearchInput = (() => {
    const path = location.pathname;
    return (
      !path.startsWith("/captures") &&
      !path.startsWith("/settings") &&
      !path.startsWith("/login") &&
      !path.startsWith("/register")
    );
  })();

  // タイムテーブルページかどうか判定
  const isTimeTablePage = (() => {
    const path = location.pathname;
    return (
      path.startsWith("/timetable") ||
      path.startsWith("/schedule") ||
      path.startsWith("/guide")
    );
  })();

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center w-full h-16 px-4 bg-[#1e1310] z-40">
      {/* ロゴ */}
      <a
        href="/"
        className="flex items-center py-3 px-2 rounded-lg hover:bg-accent transition-colors"
      >
        <img
          src="/assets/images/logo-light.svg"
          height={100}
          width={100}
          alt="CommentPlayer Logo"
          className="block"
        />
      </a>
      {/* スペーサー */}
      <div className="flex-1" />
      {/* スロット（スタイルコントロール等） */}
      {children && <div className="flex items-center">{children}</div>}
      {/* 検索ボックス */}
      {showSearchInput && (
        <InputGroup className="w-56 ml-4">
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="録画番組を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            enterKeyHint="search"
            className="text-xs"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={doSearch}
              variant="ghost"
              size="icon-xs"
              aria-label="検索実行"
            >
              <Search size={18} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}{" "}

      {/* PWAインストールボタン */}
      {isButtonDisplay && !isTimeTablePage && (
        <Button
          onClick={() => pwaInstallHandler.install()}
          variant="default"
          size="sm"
          className="ml-4 flex items-center gap-1"
        >
          <Download size={20} className="mr-1" />
          アプリとしてインストール
        </Button>
      )}
    </header>
  );
}
