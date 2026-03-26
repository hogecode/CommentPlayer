'use client';

import { Comment } from '@/types/danmaku';
import { useEffect, useRef, useState } from 'react';
import DPlayer from './DPlayer';
import CommentDelay from './CommentDelay';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** ビデオID（スクリーンショットアップロード用） */
  videoId?: number;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
}

/**
 * DPlayer を使った弾幕付き動画プレイヤー統合コンポーネント。
 *
 * DPlayerコンポーネントとCommentDelayコンポーネントを組み合わせて
 * 動画再生とコメント遅延コントロールの機能を提供します。
 * CommentDelayは A、B、C コメント遷移機能を備えています。
 */
export default function DPlayerVideo({ src = '', videoId, commentList = [] }: Props) {
  const [delay, setDelay] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const dplayerRef = useRef<any>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // DPlayer インスタンスの参照を設定
  useEffect(() => {
    // DPlayer が初期化されるまで待機
    const timer = setInterval(() => {
      const dplayerContainer = document.querySelector('.dplayer-container');
      if (dplayerContainer && (window as any).__dplayerInstance) {
        dplayerRef.current = (window as any).__dplayerInstance;
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [src]);

  // 再生時刻を定期的に取得
  useEffect(() => {
    const updateTime = () => {
      if (dplayerRef.current?.video?.currentTime !== undefined) {
        setCurrentTime(dplayerRef.current.video.currentTime);
      }
    };

    timeUpdateIntervalRef.current = setInterval(updateTime, 100);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="dplayer-video-wrapper space-y-4">
      {/* 動画プレイヤー */}
      <DPlayer
        src={src}
        videoId={videoId}
        commentList={commentList}
        delayOffset={delay}
      />

      {/* コメント遅延コントロール */}
      <CommentDelay
        currentTime={currentTime}
        comments={commentList}
        commentDelay={delay}
        handleCommentDelay={setDelay}
      />
    </div>
  );
}
