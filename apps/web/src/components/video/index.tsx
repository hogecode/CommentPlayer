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
  /** 現在の再生時間が更新されたときのコールバック */
  onCurrentTimeChange?: (time: number) => void;
}

/**
 * DPlayer を使った弾幕付き動画プレイヤー統合コンポーネント。
 *
 * DPlayerコンポーネントとCommentDelayコンポーネントを組み合わせて
 * 動画再生とコメント遅延コントロールの機能を提供します。
 * CommentDelayは A、B、C コメント遷移機能を備えています。
 */
export default function DPlayerVideo({ src = '', videoId, commentList = [], onCurrentTimeChange }: Props) {
  const [delay, setDelay] = useState(0);

  return (
    <div className="dplayer-video-wrapper space-y-4">
      {/* 動画プレイヤー */}
      <DPlayer
        src={src}
        videoId={videoId}
        commentList={commentList}
        delayOffset={delay}
        onCurrentTimeChange={onCurrentTimeChange}
      />
    </div>
  );
}
