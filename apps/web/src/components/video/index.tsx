'use client';

import { Comment } from '@/types/danmaku';
import { useState } from 'react';
import DPlayer from './DPlayer';
import CommentDelayControl from './CommentDelayControl';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
}

/**
 * DPlayer を使った弾幕付き動画プレイヤー統合コンポーネント。
 *
 * DPlayerコンポーネントとCommentDelayControlコンポーネントを組み合わせて
 * 動画再生とコメント遅延コントロールの機能を提供します。
 */
export default function DPlayerVideo({ src = '', commentList = [] }: Props) {
  const [delay, setDelay] = useState(0);

  return (
    <div className="dplayer-video-wrapper">
      {/* 動画プレイヤー */}
      <DPlayer src={src} commentList={commentList} delayOffset={delay} />

      {/* コメント遅延コントロール */}
      <CommentDelayControl delay={delay} onChange={setDelay} />
    </div>
  );
}
