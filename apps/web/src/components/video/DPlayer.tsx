'use client';

import { Comment } from '@/types/danmaku';
import { useSettingsStore } from '@/stores/settings-store';
import { usePlayerHeaderStore } from '@/stores/player-header-store';
import { useEffect, useRef } from 'react';
import Message from '@/message';
import { useCreateCaptureMutation } from '@/services/useCaptures';
import VideoHeader from '@/components/video/VideoHeader';

interface Props {
  /** 動画ファイルのURL */
  src?: string;
  /** ビデオID（スクリーンショットアップロード用） */
  videoId?: number;
  /** 初期表示する弾幕データ */
  commentList?: Comment[];
  /** コメント遅延オフセット（秒） */
  delayOffset?: number;
  /** 再生時間が更新されたときのコールバック */
  onCurrentTimeChange?: (time: number) => void;
  /** ビデオタイトル（VideoHeader表示用） */
  videoTitle?: string;
  /** プログラム時間情報（VideoHeader表示用） */
  programTime?: string;
  /** タイムシフト表示フラグ（VideoHeader表示用） */
  isShowingOriginalBroadcastTime?: boolean;
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
export default function DPlayer({ 
  src = '', 
  videoId, 
  commentList: danList = [], 
  delayOffset = 0, 
  onCurrentTimeChange,
  videoTitle,
  programTime,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const DPlayerRef = useRef<any>(null);
  const commentListRef = useRef<Comment[]>(danList);
  const videoIdRef = useRef<number | undefined>(videoId);
  const mutateRef = useRef<any>(null);

  const { settings } = useSettingsStore();
  const { showHeader: toggleHeaderVisibility, hideHeader } = usePlayerHeaderStore();
  const createCaptureMutation = useCreateCaptureMutation();
  
  // mutateを参照に保存
  useEffect(() => {
    mutateRef.current = createCaptureMutation.mutate;
  }, [createCaptureMutation.mutate]);

  // danList が変わったら ref を同期
  useEffect(() => {
    commentListRef.current = danList;
  }, [danList]);

  // videoId が変わったら ref を同期
  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

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
        loop: true,
        autoplay: true,
        hotkey: true,
        screenshot: true,
        crossOrigin: 'anonymous',
        volume: 1.0,
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

      // スクリーンショットボタンのクリックイベントをカスタマイズ
      setTimeout(() => {
        const captureButton = containerRef.current?.querySelector('.dplayer-camera-icon');
        if (captureButton) {
          captureButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();

            try {
              // ビデオ要素を直接キャプチャ
              const videoWrapper = containerRef.current?.querySelector('.dplayer-video-wrap') as HTMLElement | null;
              const videoElement = videoWrapper?.querySelector('video') as HTMLVideoElement | null;
              
              if (!videoElement) {
                Message.error('ビデオ要素が見つかりません');
                return;
              }

              // 現在再生中の動画のキャプチャを ImageBitmap として取得
              const imageBitmap = await createImageBitmap(videoElement);
              
              try {
                // OffscreenCanvas を使用して ImageBitmap から直接 Blob に変換
                const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
                const ctx = offscreenCanvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(imageBitmap, 0, 0);
                  
                  // OffscreenCanvas を Blob に変換
                  const blob = await offscreenCanvas.convertToBlob({ type: 'image/png' });
                  
                  console.log('Screenshot data:', { blob, videoId: videoIdRef.current, mutate: mutateRef.current });
                  
                  if (!blob) {
                    Message.error('スクリーンショットのBlob生成に失敗しました');
                    return;
                  }
                  
                  if (!videoIdRef.current) {
                    Message.error('ビデオIDが設定されていません');
                    return;
                  }
                  
                  if (!mutateRef.current) {
                    Message.error('アップロード機能が初期化されていません');
                    return;
                  }

                  const timestamp = new Date().getTime();
                  const file = new File([blob], `screenshot_${timestamp}.png`, { type: 'image/png' });

                  mutateRef.current({
                    file,
                    video_id: videoIdRef.current,
                  });
                  
                  Message.success('スクリーンショットをアップロードしました');
                } else {
                  Message.error('キャンバスのコンテキストを取得できません');
                }
              } catch (canvasError) {
                console.error('Canvas error:', canvasError);
                Message.error('スクリーンショット変換中にエラーが発生しました');
              } finally {
                // ImageBitmap のクリーンアップ
                imageBitmap.close();
              }
            } catch (error) {
              console.error('Screenshot error:', error);
              Message.error('スクリーンショット処理中にエラーが発生しました');
            }
          });
        }
      }, 100);

      DPlayerRef.current = dp;

      // dplayer-containerのクリック/タップイベント：ヘッダーをトグル
      const handlePlayerTap = () => {
        toggleHeaderVisibility();
      };

      // 動画外のクリック：ヘッダーを非表示
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          hideHeader();
        }
      };

      if (containerRef.current) {
        containerRef.current.addEventListener('click', handlePlayerTap);
        containerRef.current.addEventListener('touchstart', handlePlayerTap);
        document.addEventListener('click', handleOutsideClick);
      }

      // 再生時間更新イベントをリッスン
      if (onCurrentTimeChange && dp.video) {
        const handleTimeUpdate = () => {
          onCurrentTimeChange(dp.video.currentTime);
        };
        
        dp.video.addEventListener('timeupdate', handleTimeUpdate);
        
        // クリーンアップ関数を保存
        DPlayerRef.current._cleanup = () => {
          dp.video.removeEventListener('timeupdate', handleTimeUpdate);
          // リスナーをクリーンアップ
          if (containerRef.current) {
            containerRef.current.removeEventListener('click', handlePlayerTap);
            containerRef.current.removeEventListener('touchstart', handlePlayerTap);
          }
          document.removeEventListener('click', handleOutsideClick);
        };
      } else {
        // onCurrentTimeChange がない場合のクリーンアップ
        DPlayerRef.current._cleanup = () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener('click', handlePlayerTap);
            containerRef.current.removeEventListener('touchstart', handlePlayerTap);
          }
          document.removeEventListener('click', handleOutsideClick);
        };
      }
    });

    return () => {
      cancelled = true;
      DPlayerRef.current?._cleanup?.();
      DPlayerRef.current?.destroy();
      DPlayerRef.current = null;
    };
  }, [src, videoId, onCurrentTimeChange, toggleHeaderVisibility, hideHeader]);

  // delayOffset が変わったらコメント位置を再同期
  useEffect(() => {
    if (DPlayerRef.current?.danmaku) {
      DPlayerRef.current.danmaku.options.time = () => DPlayerRef.current.video.currentTime - delayOffset;
      DPlayerRef.current.danmaku.seek();
    }
  }, [delayOffset]);

  return (
    <div className="dplayer-container-wrapper group relative w-full h-full">
      {/* ビデオヘッダー */}
      <VideoHeader
        title={videoTitle}
        programTime={programTime}
      />
      {/* DPlayer はこの div に直接マウントされる */}
      <div ref={containerRef} className="dplayer-container" />
    </div>
  );
}
