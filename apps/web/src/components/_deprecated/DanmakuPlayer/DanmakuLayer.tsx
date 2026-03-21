'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useDanmaku } from './useDanmaku';
import type { Dan, DanmakuItem } from '@/types/danmaku';

/**
 * 親コンポーネントから弾幕操作を呼べるようにする公開インターフェース。
 * useImperativeHandle でこの型の関数群を公開する。
 */
export interface DanmakuLayerHandle {
  /** 弾幕データをロードしてフレームループを開始 */
  load: (dan: Dan[]) => void;
  /** シーク後のインデックス・DOM再同期 */
  seek: () => void;
  /** 一時停止解除 */
  play: () => void;
  /** 一時停止 */
  pause: () => void;
  /** 弾幕を表示（seekしてから再開） */
  show: () => void;
  /** 弾幕を非表示（クリアして停止） */
  hide: () => void;
  /** コメントを即時送信・描画 */
  sendDan: (item: DanmakuItem) => void;
  /** アニメーション速度を変更（1.0 = 通常） */
  setSpeed: (rate: number) => void;
  /** trueにするとレーン制限を無効化して重ね表示 */
  setUnlimited: (val: boolean) => void;
}

interface Props {
  /** 現在の動画再生時間（秒）を返すコールバック */
  getTime: () => number;
}

/**
 * 弾幕オーバーレイ層。
 * 動画の上に position: absolute で重ねて使う想定。
 * 描画ロジックは useDanmaku に委譲し、このコンポーネントはDOMのマウント点のみ担う。
 */
const DanmakuLayer = forwardRef<DanmakuLayerHandle, Props>(({ getTime }, ref) => {
  // 弾幕アイテムが直接appendChild されるコンテナ
  const containerRef = useRef<HTMLDivElement>(null);
  const danmaku      = useDanmaku(containerRef, getTime);

  // アンマウント時にrAFを止めてDOMをクリーンアップ
  useEffect(() => {
    return () => danmaku.destroy();
  }, [danmaku]);

  // 親コンポーネントへ操作関数を公開
  useImperativeHandle(ref, () => ({
    load:         danmaku.load,
    seek:         danmaku.seek,
    play:         danmaku.play,
    pause:        danmaku.pause,
    show:         danmaku.show,
    hide:         danmaku.hide,
    sendDan:      danmaku.sendDan,
    setSpeed:     danmaku.setSpeed,
    setUnlimited: danmaku.setUnlimited,
  }));

  return (
    <div
      ref={containerRef}
      className="danmaku-container"
      // 弾幕はクリックを透過させる（動画操作を妨げない）
      aria-hidden="true"
    />
  );
});

DanmakuLayer.displayName = 'DanmakuLayer';
export default DanmakuLayer;
