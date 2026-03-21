'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import DanmakuLayer, { type DanmakuLayerHandle } from './DanmakuLayer';
import type { Dan, DanmakuItem } from '@/types/danmaku';

interface Props {
  /** 動画ファイルのURL（空でも可） */
  src?: string;
  /** 初期表示する弾幕データ */
  danList?: Dan[];
}

/** コメント入力欄に表示するカラーパレット */
const SAMPLE_COLORS = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b'];

/**
 * 弾幕付き動画プレイヤー。
 * <video> の上に DanmakuLayer を重ね、動画イベントと弾幕の再生状態を同期する。
 * コメント入力フォームからリアルタイムに弾幕を送信できる。
 */
export default function DanmakuPlayer({ src, danList = [] }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const danmakuRef = useRef<DanmakuLayerHandle>(null);

  const [inputText,    setInputText]    = useState('');
  const [inputColor,   setInputColor]   = useState('#ffffff');
  const [showDanmaku,  setShowDanmaku]  = useState(true);

  /** 動画の現在再生時間を返す（useDanmaku に渡す） */
  const getTime = useCallback(() => videoRef.current?.currentTime ?? 0, []);

  // danList が変わったらフレームループを再起動
  useEffect(() => {
    if (danList.length > 0) {
      danmakuRef.current?.load(danList);
    }
  }, [danList]);

  // ---- 動画イベントハンドラ ----

  /** 再生開始：弾幕アニメーションを再開 */
  const handlePlay   = useCallback(() => danmakuRef.current?.play(),  []);
  /** 一時停止：弾幕アニメーションを停止 */
  const handlePause  = useCallback(() => danmakuRef.current?.pause(), []);
  /** シーク完了：DOM上の弾幕をクリアして現在時刻に同期 */
  const handleSeeked = useCallback(() => danmakuRef.current?.seek(),  []);

  /** 弾幕表示トグル */
  const handleToggleDanmaku = useCallback(() => {
    setShowDanmaku((prev) => {
      if (prev) {
        danmakuRef.current?.hide();
      } else {
        danmakuRef.current?.show();
      }
      return !prev;
    });
  }, []);

  /** コメントを送信して弾幕として即時描画 */
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const item: DanmakuItem = { text, color: inputColor, type: 'right', size: 'medium' };
    danmakuRef.current?.sendDan(item);
    setInputText('');
  }, [inputText, inputColor]);

  /** Enterキーで送信 */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSend();
    },
    [handleSend],
  );

  return (
    <div className="danmaku-player">
      {/* 動画と弾幕オーバーレイを重ねるラッパー */}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={src}
          className="video-element"
          controls
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeeked}
        />
        {/* 動画の上に弾幕レイヤーを絶対配置 */}
        <DanmakuLayer ref={danmakuRef} getTime={getTime} />
      </div>

      {/* ---- コントロールバー ---- */}
      <div className="danmaku-controls">
        {/* 弾幕ON/OFFトグル */}
        <button
          onClick={handleToggleDanmaku}
          className={`toggle-btn ${showDanmaku ? 'active' : ''}`}
        >
          弾幕 {showDanmaku ? 'ON' : 'OFF'}
        </button>

        {/* カラーパレット：コメントの色を選択 */}
        <div className="color-palette">
          {SAMPLE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setInputColor(c)}
              className={`color-swatch ${inputColor === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`コメント色: ${c}`}
            />
          ))}
        </div>

        {/* コメント入力欄 */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="コメントを入力..."
          className="danmaku-input"
          maxLength={100}
        />

        {/* 送信ボタン */}
        <button onClick={handleSend} className="send-btn">
          送信
        </button>
      </div>
    </div>
  );
}
