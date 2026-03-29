"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Comment } from "@/types/danmaku";
import { useSettingsStore } from "@/stores/settings-store";
import { CommentUtils } from "@/lib/comment-utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Message from "@/message";
import { MoreVertical, Copy, User, Ban, Filter, ArrowDown } from "lucide-react";
import { Video } from "dplayer/dist/d.ts/types";
import { EntityVideo } from "@/generated";

interface CommentListProps {
  /** コメント一覧 */
  comments: Comment[];
  /** 再生モード ('Live' または 'Video') */
  playbackMode: "Live" | "Video";
  /** ビデオの現在の再生位置（秒） */
  currentPlaybackPosition?: number;
  /** ユーザーがコメントをクリック時のコールバック */
  onCommentClick?: (comment: Comment) => void;
  /** ビデオデータ */
  video: EntityVideo;
}

interface CommentItemWithId extends Comment {
  _localId?: string;
}

/**
 * DPlayer用の仮想化されたコメントリストコンポーネント
 * TanStack Virtualizedを使用してパフォーマンスを最適化
 */
export default function CommentList({
  comments,
  playbackMode,
  currentPlaybackPosition = 0,
  onCommentClick,
  video,
}: CommentListProps) {
  const { settings } = useSettingsStore();
  const [displayedComments, setDisplayedComments] = useState<
    CommentItemWithId[]
  >([]);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuComment, setContextMenuComment] =
    useState<CommentItemWithId | null>(null);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // コメントをフィルタリング（ミュート設定を反映）
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      return !CommentUtils.isMutedComment(
        comment.text,
        comment.author,
        comment.color,
        comment.type,
        comment.size,
        settings,
      );
    });
  }, [comments, settings]);

  // ローカルIDを付与
  useEffect(() => {
    const withIds = filteredComments.map((comment, index) => ({
      ...comment,
      _localId: `${comment.time}-${index}-${comment.text}`,
    }));
    setDisplayedComments(withIds);
  }, [filteredComments]);

  // 仮想化スクローラーのセットアップ
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: displayedComments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30, // コメント行の推定高さ（px）
    overscan: 10,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent?.includes("Mac")
        ? undefined
        : (element) => element?.getBoundingClientRect().height ?? 30,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // スクロール位置の監視
  const handleScroll = useCallback(() => {
    if (!parentRef.current || isUserScrollingRef.current) return;

    const element = parentRef.current;
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 10;

    if (!isAtBottom) {
      setIsManualScroll(true);
    } else {
      setIsManualScroll(false);
    }
  }, []);

  // 動画の再生時間に基づいて表示するコメントインデックスを計算
  useEffect(() => {
    if (playbackMode !== "Video" || displayedComments.length === 0) return;

    const findCurrentCommentIndex = (fixedVideoTime: number) => {
      let index = 0;

      // コメントの再生時間が現在の再生時間より小さい最大のインデックスを探す
      for (let i = currentCommentIndex; i < displayedComments.length; i++) {
        if (displayedComments[i].time <= fixedVideoTime) {
          index = i;
        } else {
          break; // 条件を満たさない場合はループを抜ける
        }
      }

      // currentCommentIndex以降で満たさないコメントがあった場合、二分探索を実行
      // シークで移動した場合用
      if (displayedComments[index].time > fixedVideoTime) {
        let low = 0;
        let high = displayedComments.length - 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (displayedComments[mid].time <= fixedVideoTime) {
            index = mid;
            low = mid + 1; // 満たすインデックスを見つけたので、次のインデックスを調べる
          } else {
            high = mid - 1;
          }
        }
      }

      return index;
    };

    const index = findCurrentCommentIndex(currentPlaybackPosition);
    setCurrentCommentIndex(index);

    // 再生時間に合わせてスクロール
    if (parentRef.current) {
      virtualizer.scrollToIndex(index, {
        align: "end",
        behavior: "auto",
      });
    }
  }, [currentPlaybackPosition, playbackMode, displayedComments, virtualizer]);

  // 自動スクロール
  useEffect(() => {
    if (isManualScroll || !parentRef.current) return;

    // 最新のコメントまでスクロール
    if (displayedComments.length > 0) {
      virtualizer.scrollToIndex(displayedComments.length - 1, {
        align: "end",
        behavior: "auto",
      });
    }
  }, [displayedComments.length, playbackMode, isManualScroll, virtualizer]);

  // ビデオ再生時のコメントクリック処理
  const handleCommentClick = useCallback(
    (comment: Comment) => {
      if (playbackMode === "Video" && onCommentClick) {
        onCommentClick(comment);
      }
    },
    [playbackMode, onCommentClick],
  );

  const handleMuteKeyword = useCallback((comment: CommentItemWithId) => {
    const { settings: currentSettings, updateSettings } =
      useSettingsStore.getState();
    CommentUtils.addMutedKeywords(
      comment.text,
      currentSettings,
      updateSettings,
    );
    Message.success("このコメントをミュートしました");
    setContextMenuOpen(false);
  }, []);

  const handleMuteUser = useCallback((comment: CommentItemWithId) => {
    if (comment.author) {
      const { settings: currentSettings, updateSettings } =
        useSettingsStore.getState();
      CommentUtils.addMutedNiconicoUserIDs(
        comment.author,
        currentSettings,
        updateSettings,
      );
      Message.success("このユーザーをミュートしました");
    }
    setContextMenuOpen(false);
  }, []);

  const handleAutoScrollButtonClick = useCallback(() => {
    setIsManualScroll(false);
    if (displayedComments.length > 0) {
      // 現在の再生位置に最も近いコメントを見つける
      let targetIndex = 0;
      for (let i = 0; i < displayedComments.length; i++) {
        if (displayedComments[i].time <= currentPlaybackPosition) {
          targetIndex = i;
        } else {
          break;
        }
      }
      virtualizer.scrollToIndex(targetIndex, {
        align: "end",
        behavior: "smooth",
      });
    }
  }, [displayedComments, currentPlaybackPosition, virtualizer]);

  return (
    <div className="flex flex-col h-full ">
      {/* ヘッダー */}
      <div className="flex items-center w-4/5 justify-between px-4 py-1 border-b border-border">
        <h4 className="font-bold flex items-center gap-2">
          <span>コメント</span>
        </h4>
        {/* ミュート設定ボタン
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Filter className="size-4" />
          <span>ミュート設定</span>
        </Button>
         */}
      </div>

      {/* コメントリスト（仮想化） */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
      >
        {displayedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-fulltext-center">
            <div className="text-sm font-semibold mb-2">
              'コメントを読み込み中...'
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => (
              <div
                key={displayedComments[virtualItem.index]._localId}
                data-index={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "80%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <CommentItem
                  comment={displayedComments[virtualItem.index]}
                  onCommentClick={handleCommentClick}
                  onContextMenu={(e) => {
                    setContextMenuComment(displayedComments[virtualItem.index]);
                    setContextMenuOpen(true);
                  }}
                  video={video}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自動スクロールボタン
      {isManualScroll && displayedComments.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <Button
            variant="default"
            size="icon"
            onClick={handleAutoScrollButtonClick}
            className="rounded-full shadow-lg"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
        </div>
      )}
       */}

      {/* コンテキストメニュー */}
      {contextMenuComment && (
        <CommentContextMenu
          comment={contextMenuComment}
          open={contextMenuOpen}
          onOpenChange={setContextMenuOpen}
          onMuteKeyword={handleMuteKeyword}
          onMuteUser={handleMuteUser}
        />
      )}
    </div>
  );
}

/**
 * コメント項目コンポーネント
 */
interface CommentItemProps {
  comment: CommentItemWithId;
  onCommentClick: (comment: Comment) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  video: EntityVideo;
}

/**
 * コメントの実時刻を計算し、MM/DD HH:mm:ss 形式でフォーマット
 */
function formatCommentTime(
  comment: CommentItemWithId,
  video: EntityVideo,
): string {
  // jikkyo_date がある場合はそれを使用
  if (video.jikkyo_date) {
    // video.jikkyo_dateはISO 8601形式の文字列（例: "2025-06-07T15:00:00Z"）
    const startDate = new Date(video.jikkyo_date);
    // comment.timeは秒単位なので、ミリ秒に変換してを加算
    const commentDate = new Date(startDate.getTime() + (comment.time || 0) * 1000);
    const month = String(commentDate.getMonth() + 1).padStart(2, "0");
    const day = String(commentDate.getDate()).padStart(2, "0");
    const hours = String(commentDate.getHours()).padStart(2, "0");
    const minutes = String(commentDate.getMinutes()).padStart(2, "0");
    const seconds = String(commentDate.getSeconds()).padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  // jikkyo_date がない場合は秒単位で表示（フォールバック）
  return `${comment.time?.toFixed(0)}s`;
}

function CommentItem({
  comment,
  onCommentClick,
  onContextMenu,
  video,
}: CommentItemProps) {
  return (
    <div
      className={`px-4 py-2 text-sm  flex items-center justify-between group transition-colors  `}
      onClick={() => onCommentClick(comment)}
    >
      <span
        className="truncate flex-1 break-words overflow-hidden text-ellipsis"
        style={{ color: comment.color || "#FFEAEA" }}
        title={comment.text}
      >
        {comment.text}
      </span>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <span className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {formatCommentTime(comment, video)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
          className="transition-opacity p-1 hover:bg-muted rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * コメントコンテキストメニューコンポーネント
 */
interface CommentContextMenuProps {
  comment: CommentItemWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMuteKeyword: (comment: CommentItemWithId) => void;
  onMuteUser: (comment: CommentItemWithId) => void;
}

function CommentContextMenu({
  comment,
  open,
  onOpenChange,
  onMuteKeyword,
  onMuteUser,
}: CommentContextMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <MoreVertical size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {comment.author && (
          <>
            <DropdownMenuItem
              onClick={() => onMuteUser(comment)}
              className="gap-2"
            >
              <Ban className="w-4 h-4" />
              <span>このコメントの投稿者をミュート</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          onClick={() => onMuteKeyword(comment)}
          className="gap-2"
        >
          <Ban className="w-4 h-4" />
          <span>このコメントをミュート</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
