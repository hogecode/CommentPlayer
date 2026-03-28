'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Comment } from '@/types/danmaku';
import { useSettingsStore } from '@/stores/settings-store';
import { CommentUtils } from '@/lib/comment-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Message from '@/message';
import { MoreVertical, Copy, User, Ban, Filter, ArrowDown } from 'lucide-react';

interface CommentListProps {
  /** コメント一覧 */
  comments: Comment[];
  /** 再生モード ('Live' または 'Video') */
  playbackMode: 'Live' | 'Video';
  /** ビデオの現在の再生位置（秒） */
  currentPlaybackPosition?: number;
  /** ユーザーがコメントをクリック時のコールバック */
  onCommentClick?: (comment: Comment) => void;
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
}: CommentListProps) {
  const { settings } = useSettingsStore();
  const [displayedComments, setDisplayedComments] = useState<CommentItemWithId[]>([]);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuComment, setContextMenuComment] = useState<CommentItemWithId | null>(null);
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
        settings
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
      typeof window !== 'undefined' && navigator.userAgent?.includes('Mac')
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

  // ユーザーホイールスクロール検出
  const handleWheel = useCallback(() => {
    isUserScrollingRef.current = true;
    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 100);
  }, []);

  // タッチスクロール検出
  const handleTouchStart = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isUserScrollingRef.current = false;
  }, []);

  // 再生時間に応じた自動スクロール（ビデオモード専用）
  useEffect(() => {
    if (playbackMode !== 'Video' || !parentRef.current) return;
    if (displayedComments.length === 0) return;

    // 現在の再生時間に最も近いコメントのインデックスを見つける
    let targetIndex = 0;
    for (let i = 0; i < displayedComments.length; i++) {
      if (displayedComments[i].time <= currentPlaybackPosition) {
        targetIndex = i;
      } else {
        break;
      }
    }
    
    // スクロール位置を更新（毎回実行）
    virtualizer.scrollToIndex(targetIndex, {
      align: 'end',
      behavior: 'auto',
    });
  }, [currentPlaybackPosition, playbackMode, displayedComments, virtualizer]);

  // ライブ時の自動スクロール
  useEffect(() => {
    if (playbackMode !== 'Live' || isManualScroll || !parentRef.current) return;

    // 最新のコメントまでスクロール
    if (displayedComments.length > 0) {
      virtualizer.scrollToIndex(displayedComments.length - 1, {
        align: 'end',
        behavior: 'auto',
      });
    }
  }, [displayedComments.length, playbackMode, isManualScroll, virtualizer]);

  // ビデオ再生時のコメントクリック処理
  const handleCommentClick = useCallback(
    (comment: Comment) => {
      if (playbackMode === 'Video' && onCommentClick) {
        onCommentClick(comment);
      }
    },
    [playbackMode, onCommentClick]
  );

  // ドロップダウンメニュー処理
  const handleCopyText = useCallback((comment: CommentItemWithId) => {
    navigator.clipboard.writeText(comment.text);
    Message.success('クリップボードにコピーしました');
    setContextMenuOpen(false);
  }, []);

  const handleCopyUserId = useCallback((comment: CommentItemWithId) => {
    if (comment.author) {
      navigator.clipboard.writeText(comment.author);
      Message.success('ユーザーIDをコピーしました');
    }
    setContextMenuOpen(false);
  }, []);

  const handleMuteKeyword = useCallback((comment: CommentItemWithId) => {
    const { settings: currentSettings, updateSettings } = useSettingsStore.getState();
    CommentUtils.addMutedKeywords(comment.text, currentSettings, updateSettings);
    Message.success('このコメントをミュートしました');
    setContextMenuOpen(false);
  }, []);

  const handleMuteUser = useCallback((comment: CommentItemWithId) => {
    if (comment.author) {
      const { settings: currentSettings, updateSettings } = useSettingsStore.getState();
      CommentUtils.addMutedNiconicoUserIDs(comment.author, currentSettings, updateSettings);
      Message.success('このユーザーをミュートしました');
    }
    setContextMenuOpen(false);
  }, []);

  const handleAutoScrollButtonClick = useCallback(() => {
    setIsManualScroll(false);
    if (displayedComments.length > 0) {
      virtualizer.scrollToIndex(displayedComments.length - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [displayedComments.length, virtualizer]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-border shrink-0">
        <h4 className="font-bold flex items-center gap-2">
          <span>コメント</span>
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Filter className="size-4" />
          <span>ミュート設定</span>
        </Button>
      </div>

      {/* コメントリスト（仮想化） */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {displayedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="text-sm font-semibold mb-2">
              {playbackMode === 'Live'
                ? 'まだコメントがありません。'
                : 'コメントを読み込み中...'}
            </div>
            <div className="text-xs text-muted-foreground">
              {playbackMode === 'Live'
                ? 'このチャンネルに対応するニコニコ実況のコメントがリアルタイムで表示されます。'
                : 'この録画番組に対応するニコニコ実況の過去ログコメントを取得しています...'}
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${totalSize}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => (
              <div
                key={displayedComments[virtualItem.index]._localId}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <CommentItem
                  comment={displayedComments[virtualItem.index]}
                  playbackMode={playbackMode}
                  onCommentClick={handleCommentClick}
                  onContextMenu={(e) => {
                    setContextMenuComment(displayedComments[virtualItem.index]);
                    setContextMenuOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自動スクロールボタン */}
      {isManualScroll && displayedComments.length > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
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

      {/* コンテキストメニュー */}
      {contextMenuComment && (
        <CommentContextMenu
          comment={contextMenuComment}
          open={contextMenuOpen}
          onOpenChange={setContextMenuOpen}
          onCopyText={handleCopyText}
          onCopyUserId={handleCopyUserId}
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
  playbackMode: 'Live' | 'Video';
  onCommentClick: (comment: Comment) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function CommentItem({
  comment,
  playbackMode,
  onCommentClick,
  onContextMenu,
}: CommentItemProps) {
  const isVideoMode = playbackMode === 'Video';

  return (
    <div
      className={`px-4 py-2 text-sm  flex items-center justify-between group hover:bg-muted/50 transition-colors border-b border-border/50 ${
        isVideoMode ? 'cursor-pointer' : ''
      }`}
      onClick={() => isVideoMode && onCommentClick(comment)}
    >
      <span
        className="flex-1 break-words overflow-hidden text-ellipsis"
        style={{ color: comment.color || '#FFEAEA' }}
        title={comment.text}
      >
        {comment.text}
      </span>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <span className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {comment.time?.toFixed(0)}s
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
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
  onCopyText: (comment: CommentItemWithId) => void;
  onCopyUserId: (comment: CommentItemWithId) => void;
  onMuteKeyword: (comment: CommentItemWithId) => void;
  onMuteUser: (comment: CommentItemWithId) => void;
}

function CommentContextMenu({
  comment,
  open,
  onOpenChange,
  onCopyText,
  onCopyUserId,
  onMuteKeyword,
  onMuteUser,
}: CommentContextMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <div style={{ display: 'none' }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onCopyText(comment)} className="gap-2">
          <Copy className="w-4 h-4" />
          <span>クリップボードにコピー</span>
        </DropdownMenuItem>

        {comment.author && (
          <>
            <DropdownMenuItem onClick={() => onCopyUserId(comment)} className="gap-2">
              <User className="w-4 h-4" />
              <span>このコメントのユーザー ID をコピー</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onMuteUser(comment)} className="gap-2">
              <Ban className="w-4 h-4" />
              <span>このコメントの投稿者をミュート</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem onClick={() => onMuteKeyword(comment)} className="gap-2">
          <Ban className="w-4 h-4" />
          <span>このコメントをミュート</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
