"use client";

import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoHeaderProps {
  /** ビデオタイトル */
  title?: string;
  /** 再生時間情報（例: "10:30 - 11:00"） */
  programTime?: string;
  /** タイムシフト表示フラグ */
  isShowingOriginalBroadcastTime?: boolean;
}

/**
 * ビデオプレイヤーのヘッダコンポーネント
 *
 * VueファイルのVideoHeader.vueを参考にして作成
 * - バック矢印ボタン（/videos/へ戻る）
 * - タイトル表示
 * - プログラム時間表示
 * - 現在時刻表示
 * - タイムシフト表示
 */
export default function VideoHeader({
  title = "",
  programTime = "",
  isShowingOriginalBroadcastTime = false,
}: VideoHeaderProps) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>("");

  // 現在時刻を更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBackClick = () => {
    navigate({ to: "/videos" });
  };

  return (
    <header
      className="absolute top-0 left-0 z-5 flex w-full items-center justify-between px-2
    transition-all duration-300 ease-in-out bg-gradient-to-b 
    from-black/80 to-transparent opacity-0 
    group-hover:opacity-100 group-hover:visibility-visible visible"
    >
      {/* バック矢印ボタン */}
      <button
        className=" flex h-12 w-12 items-center justify-center rounded transition-colors hover:bg-white/10 active:bg-white/20"
        onClick={handleBackClick}
        aria-label="戻る"
      >
        <ChevronLeft width={21} height={21} className="text-white" />
      </button>

      {/* タイトル */}
      {title && (
        <span className="mr-4 truncate text-xs font-medium text-white max-w-xs">
          {title}
        </span>
      )}

      {/* プログラム時間 */}
      {programTime && (
        <span className="whitespace-nowrap text-xs text-white/70">
          {programTime}
        </span>
      )}

      {/* スペーサー */}
      <div className="flex-1"></div>

      {/* 現在時刻 */}
      <span className="flex items-center whitespace-nowrap text-xs text-white">
        {isShowingOriginalBroadcastTime && (
          <Clock className="mr-1.5 inline-block h-4 w-4 flex-shrink-0 text-white" />
        )}
        {currentTime}
      </span>
    </header>
  );
}
