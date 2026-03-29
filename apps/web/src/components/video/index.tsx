'use client';

import { Comment } from '@/types/danmaku';
import { useEffect, useRef, useState } from 'react';
import DPlayer from './DPlayer';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** ビデオID（スクリーンショットアップロード用） */
  videoId?: number;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
  /** 現在の再生時間が更新されたときのコールバック */
  onCurrentTimeChange?: (time: number) => void;
  /** コメント遅延オフセット（秒） */
  commentDelay?: number;
  /** ビデオタイトル（VideoHeader表示用） */
  videoTitle?: string;
  /** プログラム時間情報（VideoHeader表示用） */
  programTime?: string;
}

/**
 * DPlayer を使った弾幕付き動画プレイヤー統合コンポーネント。
 *
 * DPlayerコンポーネントとCommentDelayコンポーネントを組み合わせて
 * 動画再生とコメント遅延コントロールの機能を提供します。
 * CommentDelayは A、B、C コメント遷移機能を備えています。
 */
export default function DPlayerVideo({
  src = "",
  videoId,
  commentList = [],
  onCurrentTimeChange,
  commentDelay = 0,
  videoTitle,
  programTime,
}: Props) {
  return (
    <div className="dplayer-video-wrapper space-y-4">
      <DPlayer
        src={src}
        videoId={videoId}
        commentList={commentList}
        delayOffset={commentDelay}
        onCurrentTimeChange={onCurrentTimeChange}
        videoTitle={videoTitle}
        programTime={programTime}
      />
    </div>
  );
}
