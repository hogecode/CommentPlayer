import { useEffect } from 'react';
import type { Comment } from '@/types/danmaku';

interface UseCommentDelayShortcutsProps {
  commentDelay: number;
  currentTime: number;
  commentList: Comment[];
  onCommentDelayChange: (delay: number | ((prev: number) => number)) => void;
}

/**
 * コメント遅延のキーボードショートカットを管理するカスタムフック
 * 
 * キーバインディング:
 * - Ctrl+1: 1分前へ移動（遅延-60秒）
 * - Ctrl+2: 5秒前へ移動（遅延-5秒）
 * - Ctrl+3: 5秒後へ移動（遅延+5秒）
 * - Ctrl+4: 1分後へ移動（遅延+60秒）
 * - Ctrl+R: リセット
 * - Ctrl+K: キタコメント検索
 * - Ctrl+A: Aコメント検索
 * - Ctrl+B: Bコメント検索
 */
export function useCommentDelayShortcuts({
  commentDelay,
  currentTime,
  commentList,
  onCommentDelayChange,
}: UseCommentDelayShortcutsProps) {
  // コメントデータに基づいて遅延時間を設定する
  const handleSetDelayFromComment = (text: string) => {
    const commentAfterCurrentTime = commentList.find(
      (comment) =>
        comment.text === text && comment.time >= currentTime + commentDelay,
    );

    if (commentAfterCurrentTime) {
      const delayInSeconds = commentAfterCurrentTime.time - currentTime;
      onCommentDelayChange(-delayInSeconds);
    }
  };

  // 正規表現パターンに基づいてコメントを検索し遅延時間を設定する
  const handleSetDelayFromPatternComment = (pattern: RegExp) => {
    const commentAfterCurrentTime = commentList.find(
      (comment) =>
        pattern.test(comment.text) &&
        comment.time >= currentTime + commentDelay,
    );

    if (commentAfterCurrentTime) {
      const delayInSeconds = commentAfterCurrentTime.time - currentTime;
      onCommentDelayChange(-delayInSeconds);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はショートカットを無視
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl キーが押されていない場合は処理しない
      if (!event.ctrlKey) {
        return;
      }

      switch (event.key) {
        case '1':
          // Ctrl+1: 1分前へ移動（遅延-60秒）
          event.preventDefault();
          onCommentDelayChange((prev: number) => prev + 60);
          break;
        case '2':
          // Ctrl+2: 5秒前へ移動（遅延-5秒）
          event.preventDefault();
          onCommentDelayChange((prev: number) => prev + 5);
          break;
        case '3':
          // Ctrl+3: 5秒後へ移動（遅延+5秒）
          event.preventDefault();
          onCommentDelayChange((prev: number) => prev - 5);
          break;
        case '4':
          // Ctrl+4: 1分後へ移動（遅延+60秒）
          event.preventDefault();
          onCommentDelayChange((prev: number) => prev - 60);
          break;
        case 'r':
        case 'R':
          // Ctrl+R: リセット
          event.preventDefault();
          onCommentDelayChange(0);
          break;
        case 'k':
        case 'K':
          // Ctrl+K: キタコメント検索
          event.preventDefault();
          handleSetDelayFromPatternComment(/^ｷﾀ/);
          break;
        case 'a':
        case 'A':
          // Ctrl+A: Aコメント検索
          event.preventDefault();
          handleSetDelayFromComment('A');
          break;
        case 'b':
        case 'B':
          // Ctrl+B: Bコメント検索
          event.preventDefault();
          handleSetDelayFromComment('B');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [commentDelay, commentList, currentTime, onCommentDelayChange]);
}
