'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
 * DPlayer用のコメントリストコンポーネント
 * ライブ放送とビデオ再生の両方に対応
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
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuComment, setContextMenuComment] = useState<CommentItemWithId | null>(null);
  const [showMuteSettings, setShowMuteSettings] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  // マウスホイールでのスクロール検出
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

  // スクロール位置の監視
  const handleScroll = useCallback(() => {
    const element = scrollContainerRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;
    if (!element || isAutoScrolling) return;

    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 10;

    // ユーザーがスクロールしている場合
    if (isUserScrollingRef.current && !isAtBottom) {
      setIsManualScroll(true);
    } else if (isAtBottom) {
      // 下部に到達した場合は自動スクロールに戻す
      setIsManualScroll(false);
    }
  }, [isAutoScrolling]);

  // ScrollArea内のスクロール要素を取得してイベント設定
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const scrollElement = scrollContainerRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) as HTMLDivElement;
        if (scrollElement) {
          scrollElement.addEventListener('scroll', handleScroll);
          scrollElement.addEventListener('wheel', handleWheel);
          scrollElement.addEventListener('touchstart', handleTouchStart);
          scrollElement.addEventListener('touchend', handleTouchEnd);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [handleScroll, handleWheel, handleTouchStart, handleTouchEnd]);

  // コメントをフィルタリング（ミュート設定を反映）
  useEffect(() => {
    const filtered = comments.filter((comment) => {
      // ニコニコのミュート設定をアプリケーション側にも適用
      return !CommentUtils.isMutedComment(
        comment.text,
        comment.author,
        comment.color,
        comment.type,
        comment.size,
        settings
      );
    });

    // ローカルIDを追加
    const withIds = filtered.map((comment, index) => ({
      ...comment,
      _localId: `${comment.time}-${index}-${comment.text}`,
    }));

    setDisplayedComments(withIds);
  }, [comments, settings]);

  // 自動スクロール処理
  const scrollToBottom = useCallback((smooth: boolean = false) => {
    if (!scrollContainerRef.current || isManualScroll) return;

    setIsAutoScrolling(true);

    const element = scrollContainerRef.current;
    const behavior = smooth ? 'smooth' : 'auto';

    // requestAnimationFrameで同期
    requestAnimationFrame(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior,
      });
    });

    // スクロール中のフラグをリセット
    setTimeout(() => {
      setIsAutoScrolling(false);
    }, 100);
  }, [isManualScroll]);

  // コメントが追加されたときに自動スクロール
  useEffect(() => {
    if (!isManualScroll && playbackMode === 'Live') {
      scrollToBottom(false);
    }
  }, [displayedComments.length, isManualScroll, playbackMode, scrollToBottom]);

  // ビデオ再生時のシーク処理
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
    scrollToBottom(true);
  }, [scrollToBottom]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>コメント</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMuteSettings(!showMuteSettings)}
          className="gap-1"
        >
          <Filter className="w-4 h-4" />
          <span>ミュート設定</span>
        </Button>
      </div>

      {/* コメントリスト */}
      <ScrollArea
        ref={scrollContainerRef}
        className="flex-1 overflow-hidden"
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="space-y-0">
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
            displayedComments.map((comment) => (
              <CommentItem
                key={comment._localId}
                comment={comment}
                playbackMode={playbackMode}
                onCommentClick={handleCommentClick}
                onContextMenu={(e) => {
                  setContextMenuComment(comment);
                  setContextMenuOpen(true);
                }}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* 自動スクロールボタン */}
      {isManualScroll && (
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
      className={`px-4 py-2 text-sm min-h-[28px] flex items-center justify-between group hover:bg-muted/50 transition-colors ${
        isVideoMode ? 'cursor-pointer' : ''
      }`}
      onClick={() => isVideoMode && onCommentClick(comment)}
    >
      <span
        className="flex-1 break-words"
        style={{ color: comment.color || '#FFEAEA' }}
      >
        {comment.text}
      </span>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <span className="text-xs text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
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
