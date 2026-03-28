"use client";

import { useLocation, Link } from "@tanstack/react-router";
import { Film, Image, ListMusic, History, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";
interface SidebarProps {
  /**
   * アイコンのみモード: テキストを非表示にし、幅を縮小する
   * 番組表ページでは番組表の表示領域を広く取るためにこのモードを使用する
   */
  iconOnly?: boolean;
}

/**
 * ナビゲーションリンクの定義
 */
const navigationLinks = [
  { path: "/videos", label: "ビデオをみる", Icon: Film },
  { path: "/captures", label: "キャプチャ", Icon: Image },
  { path: "/mylist", label: "マイリスト", Icon: ListMusic },
  { path: "/watched-history", label: "視聴履歴", Icon: History },
];

export default function Sidebar({ iconOnly = true }: SidebarProps) {
  const location = useLocation();

  const isLinkActive = (linkPath: string): boolean => {
    return location.pathname.startsWith(linkPath);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#2f221f] sticky top-0 bottom-0 border-border transition-all duration-300 mb-4",
        iconOnly ? "w-16" : "w-48",
      )}
    >
      {/* ヘッダーのほうがz-index高いので表示されない、ダミーヘッダー */}
      <div className="p-4 border-b border-border"></div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto p-4 pt-10">
        <ul className="space-y-2">
          {navigationLinks.map(({ path, label, Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isLinkActive(path) &&
                    "bg-primary text-accent-foreground font-medium",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0 translate-x-[-6px]" />
                {!iconOnly && <span className="truncate">{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* フッター */}
      <div className="border-t border-border p-4 space-y-2">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isLinkActive("/settings") &&
              "bg-primary text-accent-foreground font-medium",
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0  translate-x-[-6px]" />
          {!iconOnly && <span className="truncate">設定</span>}
        </Link>
        <a
          href="https://github.com/hogecode/CommentPlayer"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isLinkActive("/information") &&
              "bg-accent text-accent-foreground font-medium",
          )}
        >
          <Info className="w-5 h-5 flex-shrink-0  translate-x-[-6px] mb-4" />
          {!iconOnly && <span className="truncate">情報</span>}
        </a>
      </div>
      <div className="p-8 border-b border-border"></div>
    </aside>
  );
}
