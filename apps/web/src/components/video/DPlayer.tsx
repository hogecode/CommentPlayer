'use client';

import { Comment } from '@/types/danmaku';
import { useSettingsStore } from '@/stores/settings-store';
import { useEffect, useRef } from 'react';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
  /** コメント遅延オフセット（秒） */
  delayOffset?: number;
}

/**
 * DPlayer を使った弾幕付き動画プレイヤーコンポーネント。
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
export default function DPlayer({ src = '', commentList: danList = [], delayOffset = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const DPlayerRef = useRef<any>(null);
  const commentListRef = useRef<Comment[]>(danList);

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

      const DPlayerModule = mod.default;

      const dp = new DPlayerModule({
        container: containerRef.current,
        theme: '#E64F97',
        lang: 'ja-jp',
        // ループ再生 (ライブ視聴では無効)
        loop: true,
        // 自動再生
        autoplay: true,
        // ショートカットキー（こちらで制御するため無効化）
        hotkey: true,
        // スクリーンショット (こちらで制御するため無効化)
        screenshot: true,
        // CORS を有効化
        crossOrigin: 'anonymous',
        // 音量の初期値
        volume: 1.0,
        // 再生速度の設定 (x1.1 を追加)
        playbackSpeed: [0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2],
        video: {
          url: src,
          type: 'normal',
        },
        // 弾幕データをローカルの danList から提供するカスタムバックエンド
        apiBackend: {
          read: (options: any) => options.success(commentListRef.current),
          send: (options: any) => options.success(), // コメント送信はローカルのみ
        },
        danmaku: {
          id: 'local',
          user: 'ユーザー',
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
        dp.danmaku.options.time = () => dp.video.currentTime - delayOffset;
      }

      DPlayerRef.current = dp;
    });

    return () => {
      cancelled = true;
      DPlayerRef.current?.destroy();
      DPlayerRef.current = null;
    };
  }, [src]);

  // delayOffset が変わったらコメント位置を再同期
  useEffect(() => {
    if (DPlayerRef.current?.danmaku) {
      DPlayerRef.current.danmaku.options.time = () => DPlayerRef.current.video.currentTime - delayOffset;
      DPlayerRef.current.danmaku.seek();
    }
  }, [delayOffset]);

  return (
    <div className="dplayer-container-wrapper">
      {/* DPlayer はこの div に直接マウントされる */}
      <div ref={containerRef} className="dplayer-container" />
    </div>
  );
}
