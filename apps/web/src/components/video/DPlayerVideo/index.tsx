'use client';

import { Comment } from '@/types/danmaku';
import { useSettingsStore } from '@/stores/settings-store';
import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
}

/**
 * DPlayer を使った弾幕付き動画プレイヤー。
 *
 * コメント遅延オフセット機能:
 *   - 正の値 → コメントを指定秒数だけ遅らせて表示（例: +5 = 動画5秒時点で0秒のコメントが出る）
 *   - 負の値 → コメントを指定秒数だけ先行して表示
 *
 * 実装原理:
 *   DPlayer 内部の danmaku.frame() と danmaku.seek() は
 *   options.time() で現在の動画時刻を取得している。
 *   初期化後に options.time を
 *     () => video.currentTime - delayOffset
 *   に差し替えることで、コメントの表示タイミングをずらす。
 */
export default function DPlayerVideo({ src = '', commentList: danList = [] }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const DPlayerRef          = useRef<any>(null);
  const delayOffsetRef = useRef(0);       // frame/seek から参照されるオフセット（秒）
  const commentListRef     = useRef<Comment[]>(danList); // apiBackend.read から参照する弾幕データ

  const [delay, setDelay] = useState(0);
  const { settings } = useSettingsStore();

  // danList が変わったら ref を同期
  useEffect(() => {
    commentListRef.current = danList;
  }, [danList]);

  // DPlayer 初期化（src が変わったら再初期化）
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import('dplayer').then((mod) => {
      if (cancelled || !containerRef.current) return;

      const DPlayer = mod.default;

      const dp = new DPlayer({
        container: containerRef.current,
        theme: "#E64F97",
        lang: "ja-jp",
        // ループ再生 (ライブ視聴では無効)
        loop: true,
        // 自動再生
        autoplay: true,
        // ショートカットキー（こちらで制御するため無効化）
        hotkey: true,
        // スクリーンショット (こちらで制御するため無効化)
        screenshot: true,
        // CORS を有効化
        crossOrigin: "anonymous",
        // 音量の初期値
        volume: 1.0,
        // 再生速度の設定 (x1.1 を追加)
        playbackSpeed: [0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2],
        video: {
          url: src,
          type: "normal",
        },
        // 弾幕データをローカルの danList から提供するカスタムバックエンド
        apiBackend: {
          read: (options: any) => options.success(commentListRef.current),
          send: (options: any) => options.success(), // コメント送信はローカルのみ
        },
        danmaku: {
          id: "local",
          user: "ユーザー",
          // コメントの流れる速度
          speedRate: settings.comment_speed_rate,
          // コメントのフォントサイズ
          fontSize: settings.comment_font_size,
          // コメント送信後にコメントフォームを閉じるかどうか
          closeCommentFormAfterSend: settings.close_comment_form_after_sending,
        },
      });

      /**
       * ── 遅延オフセットのパッチ ──
       * frame() の比較式: options.time() > item.time
       *   → (video.currentTime - offset) > item.time
       *   → video.currentTime > item.time + offset
       * seek() も同じ options.time() を使うので自動的に適用される。
       */
      if (dp.danmaku) {
        dp.danmaku.options.time = () => dp.video.currentTime - delayOffsetRef.current;
      }

      DPlayerRef.current = dp;
    });

    return () => {
      cancelled = true;
      DPlayerRef.current?.destroy();
      DPlayerRef.current = null;
    };
  }, [src]);

  /** 遅延値を変更してコメント位置を即時再同期 */
  const handleDelay = (value: number) => {
    delayOffsetRef.current = value;
    setDelay(value);
    // seek() は options.time() を使うのでパッチ後に呼ぶだけで OK
    DPlayerRef.current?.danmaku?.seek();
  };

  const delayLabel =
    delay > 0 ? `+${delay}秒 遅延` :
    delay < 0 ? `${Math.abs(delay)}秒 先行` :
    '遅延なし';

  return (
    <div className="dplayer-video-wrapper">
      {/* DPlayer はこの div に直接マウントされる */}
      <div ref={containerRef} className="dplayer-container" />

      {/* ── コメント遅延コントロール ── */}
      <div className="delay-control">
        <div className="delay-control-header">
          <span className="delay-control-title">コメント遅延調整</span>
          <span className="delay-control-value">{delayLabel}</span>
          <button
            onClick={() => handleDelay(0)}
            className="delay-reset-btn"
          >
            リセット
          </button>
        </div>

        <input
          type="range"
          min="-30"
          max="30"
          step="0.5"
          value={delay}
          onChange={(e) => handleDelay(Number(e.target.value))}
          className="delay-slider"
          aria-label="コメント遅延（秒）"
        />

        <div className="delay-scale-hints">
          <span>← 30秒先行</span>
          <span>0</span>
          <span>30秒遅延 →</span>
        </div>
      </div>
    </div>
  );
}
