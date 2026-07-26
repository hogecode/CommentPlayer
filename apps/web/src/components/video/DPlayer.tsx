'use client';

import { Comment } from '@/types/danmaku';
import { useSettingsStore } from '@/stores/settings-store';
import { usePlayerHeaderStore } from '@/stores/player-header-store';
import { useEffect, useRef, useCallback } from 'react';
import Message from '@/message';
import { useCreateCaptureMutation } from '@/services/useCaptures';
import { SeriesApi } from '@/generated';
import VideoHeader from '@/components/video/VideoHeader';

/**
 * 視聴履歴更新の間隔（秒）
 * この間隔で視聴履歴の再生位置を更新する
 */
const WATCHED_HISTORY_UPDATE_INTERVAL = 10;

/**
 * 視聴開始から履歴に追加するまでの時間（秒）
 * 動画視聴開始からこの秒数経過した場合のみ視聴履歴に追加する
 */
const WATCHED_HISTORY_THRESHOLD_SECONDS = 5;

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
  /** 初期再生位置（秒） */
  initialPlaybackPosition?: number;
  /** 現在の動画の詳細情報（次動画計算用） */
  currentVideo?: any;
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
  initialPlaybackPosition,
  currentVideo,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const DPlayerRef = useRef<any>(null);
  const commentListRef = useRef<Comment[]>(danList);
  const videoIdRef = useRef<number | undefined>(videoId);
  const delayOffsetRef = useRef<number>(delayOffset);

  const { settings } = useSettingsStore();
  const { showHeader: toggleHeaderVisibility, hideHeader } = usePlayerHeaderStore();
  const createCaptureMutation = useCreateCaptureMutation();

  // danList が変わったら ref を同期
  useEffect(() => {
    commentListRef.current = danList;
  }, [danList]);

  // videoId が変わったら ref を同期
  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

  // delayOffset が変わったら ref を同期
  useEffect(() => {
    delayOffsetRef.current = delayOffset;
  }, [delayOffset]);

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
        loop: false,
        autoplay: true,
        hotkey: true,
        screenshot: false,
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
        // スクリーンショット処理の共通ロジック
        const handleCaptureClick = async (e: Event) => {
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
                
                if (!blob) {
                  Message.error('スクリーンショットのBlob生成に失敗しました');
                  return;
                }
                
                if (!videoIdRef.current) {
                  Message.error('ビデオIDが設定されていません');
                  return;
                }

                const timestamp = new Date().getTime();
                const file = new File([blob], `screenshot_${timestamp}.png`, { type: 'image/png' });

                // createCaptureMutation.mutate を直接呼び出す
                createCaptureMutation.mutate({
                  file,
                  video_id: videoIdRef.current,
                  playback_position: dp.video.currentTime,
                  comment_delay: delayOffsetRef.current,
                });
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
        };

        // Document PIP を設定
        // DocumentPiPManager.ts のパターンに従った実装
        // video.requestPictureInPicture() をオーバーライドして Document Picture-in-Picture API を使用
        if (DPlayerRef.current?.video && containerRef.current) {
          const videoElement = DPlayerRef.current.video as HTMLVideoElement;
          
          // Document Picture-in-Picture API がサポートされているかチェック
          if (('documentPictureInPicture' in window) === false) {
            console.log('[DPlayer] Document Picture-in-Picture API is not supported.');
          } else {
            // オリジナルメソッドを退避
            const originalRequestPIP = videoElement.requestPictureInPicture;

            // DocumentPiPManager.ts のパターン: 非同期関数として定義
            // .bind() を使わず、直接代入することでユーザーアクティベーションを保持
            const newRequestPictureInPicture = async function() {
              const dpp = (window as any).documentPictureInPicture;
              
              // すでに Document Picture-in-Picture が開始されている場合は終了
              if (dpp.window) {
                console.log('[DPlayer] Closing existing Document PIP window...');
                dpp.window.close();
                return {} as PictureInPictureWindow;
              }

              try {
                console.log('[DPlayer] Requesting Document Picture-in-Picture window...');
                
                // Document Picture-in-Picture ウインドウをリクエスト
                const pipWindow = await dpp.requestWindow({
                width: 540,
                height: 304,
                });

                console.log('[DPlayer] Document PIP window created successfully.');

                // すべてのスタイルシートをコピー
                [...document.styleSheets].forEach((styleSheet) => {
                  try {
                    const cssRules = [...(styleSheet.cssRules as any)]
                      .map((rule) => rule.cssText)
                      .join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pipWindow.document.head.appendChild(style);
                  } catch (e) {
                    // CORS エラーの場合は link 要素でインポート
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = (styleSheet.media as any).mediaText || '';
                    link.href = styleSheet.href || '';
                    pipWindow.document.head.appendChild(link);
                  }
                });

                console.log('[DPlayer] Stylesheets copied to PIP window.');

                // PIP ウインドウの背景色を設定
                pipWindow.document.body.style.backgroundColor = '#1e1310';

                // DocumentPiPManager.ts のパターンに従い、要素そのものを PIP ウインドウに移動
                // クローンではなく実際の要素を移動することで、DPlayer の完全な状態を保持
                let originalParent: HTMLElement | null = null;
                if (containerRef.current && containerRef.current.parentElement) {
                  // 元の親要素を記録しておく
                  originalParent = containerRef.current.parentElement;
                  
                  // PIP ウインドウ用のコンテナを作成
                  const pipContainer = pipWindow.document.createElement('div');
                  pipContainer.classList.add('dplayer-container-wrapper');
                  pipContainer.style.height = '100vh';
                  pipContainer.style.width = '100vw';
                  
                  // .dplayer-container をPIP ウインドウに移動（クローンではなく実際の要素）
                  pipContainer.appendChild(containerRef.current);
                  pipWindow.document.body.appendChild(pipContainer);
                  
                  console.log('[DPlayer] .dplayer-container moved to PIP window.');

                  // メインウインドウに「Picture-in-Picture で再生しています」というメッセージを表示
                  const pipMessage = document.createElement('div');
                  pipMessage.classList.add('dplayer-pip-message');
                  pipMessage.textContent = 'Picture-in-Picture で再生しています';
                  pipMessage.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    margin: 30px auto;
                    padding: 10px 20px;
                    font-size: 18px;
                    color: #999;
                    text-align: center;
                    width: 80%;
                  `;
                  originalParent.appendChild(pipMessage);

                  // pagehide イベント: ウインドウが閉じられた際
                  pipWindow.addEventListener('pagehide', () => {
                    console.log('[DPlayer] Document Picture-in-Picture window closed.');
                    // メインウインドウの「Picture-in-Picture で再生しています」メッセージを削除
                    const msg = document.querySelector('.dplayer-pip-message');
                    if (msg) {
                      msg.remove();
                    }
                    // .dplayer-container を元の位置に戻す
                    if (containerRef.current && originalParent) {
                      originalParent.appendChild(containerRef.current);
                    }
                  });
                }

                   // onenter イベント: ウインドウが表示された際
                 dpp.onenter = () => {
                   console.log('[DPlayer] Document Picture-in-Picture window entered.');
                 };

                 // ── キーボードイベント転送：PIP ウインドウでのキー入力をメインウインドウに転送 ──
                 // PIP ウインドウは独立したウインドウなため、キーボードイベントがメインウインドウに到達しない
                 // そのため、PIP ウインドウで発生したキー入力をメインウインドウに転送する
                 const handlePIPKeyDown = (e: KeyboardEvent) => {
                   console.log('[DPlayer] PIP keydown event:', e.key, e.code);
                   
                   // PIP ウインドウで発生したキーボードイベントをメインウインドウに転送
                   // DPlayer の hotkey 機能が応答するよう、メインウインドウの video 要素にフォーカスを与える
                   const mainVideoElement = DPlayerRef.current?.video;
                   if (mainVideoElement && !mainVideoElement.contains(document.activeElement)) {
                     // キーボードイベントをメインウインドウに転送
                     const transferredEvent = new KeyboardEvent(e.type, {
                       bubbles: true,
                       cancelable: true,
                       key: e.key,
                       code: e.code,
                       keyCode: (e as any).keyCode,
                       charCode: (e as any).charCode,
                       ctrlKey: e.ctrlKey,
                       altKey: e.altKey,
                       shiftKey: e.shiftKey,
                       metaKey: e.metaKey,
                     });
                     
                     // メインウインドウの document に転送イベントをディスパッチ
                     window.document.dispatchEvent(transferredEvent);
                     console.log('[DPlayer] Transferred keydown event to main window:', e.key);
                   }
                 };

                 const handlePIPKeyUp = (e: KeyboardEvent) => {
                   const transferredEvent = new KeyboardEvent(e.type, {
                     bubbles: true,
                     cancelable: true,
                     key: e.key,
                     code: e.code,
                     keyCode: (e as any).keyCode,
                     charCode: (e as any).charCode,
                     ctrlKey: e.ctrlKey,
                     altKey: e.altKey,
                     shiftKey: e.shiftKey,
                     metaKey: e.metaKey,
                   });
                   window.document.dispatchEvent(transferredEvent);
                 };

                 // PIP ウインドウにキーボードリスナーを登録
                 pipWindow.addEventListener('keydown', handlePIPKeyDown);
                 pipWindow.addEventListener('keyup', handlePIPKeyUp);
                 console.log('[DPlayer] Keyboard event listeners attached to PIP window.');

                 // pagehide イベント時にリスナーをクリーンアップ（既存の pagehide リスナーを更新）
                 const originalPagehideListener = pipWindow.onpagehide;
                 pipWindow.addEventListener('pagehide', () => {
                   console.log('[DPlayer] Document Picture-in-Picture window closed.');
                   // キーボードリスナーを削除
                   pipWindow.removeEventListener('keydown', handlePIPKeyDown);
                   pipWindow.removeEventListener('keyup', handlePIPKeyUp);
                   
                   // メインウインドウの「Picture-in-Picture で再生しています」メッセージを削除
                   const msg = document.querySelector('.dplayer-pip-message');
                   if (msg) {
                     msg.remove();
                   }
                   // .dplayer-container を元の位置に戻す
                   if (containerRef.current && originalParent) {
                     originalParent.appendChild(containerRef.current);
                   }
                 });

                 console.log('[DPlayer] Document Picture-in-Picture initialized.');
                 return {} as PictureInPictureWindow;
              } catch (error: any) {
                console.error('[DPlayer] Document PIP error:', error);
                // フォールバック: 標準的なvideo PIP
                console.log('[DPlayer] Falling back to standard video PIP.');
                try {
                  return await originalRequestPIP.call(videoElement);
                } catch (fallbackError) {
                  console.error('[DPlayer] Standard PIP also failed:', fallbackError);
                  throw fallbackError;
                }
              }
            };

            // 直接代入（.bind() は使わない）
            videoElement.requestPictureInPicture = newRequestPictureInPicture;

            console.log('[DPlayer] Document Picture-in-Picture hook completed.');
          }
        }

        // .dplayer-comment-icon の左側にカスタムカメラアイコンを挿入
        const commentIcon = containerRef.current?.querySelector('.dplayer-comment-icon');
        if (commentIcon) {
          commentIcon.insertAdjacentHTML('beforebegin', `
            <div class="dplayer-icon dplayer-capture-icon" aria-label="キャプチャ"
                data-balloon-nofocus="" data-balloon-pos="up">
                <span class="dplayer-icon-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z"></path></svg>
                </span>
            </div>
          `);
        }

        // 新しく挿入したカスタムアイコンにクリックイベントを付与
        const newCaptureButton = containerRef.current?.querySelector('.dplayer-capture-icon');
        if (newCaptureButton) {
          newCaptureButton.addEventListener('click', handleCaptureClick);
        }

        // 念のため既存の .dplayer-camera-icon にも付与（存在する場合）
        const captureButton = containerRef.current?.querySelector('.dplayer-camera-icon');
        if (captureButton) {
          captureButton.addEventListener('click', handleCaptureClick);
        }
      }, 100);

      DPlayerRef.current = dp;

      // 初期再生位置へシーク
      if (initialPlaybackPosition !== undefined && initialPlaybackPosition > 0) {
        dp.video.currentTime = initialPlaybackPosition;
        if (dp.danmaku) {
          dp.danmaku.seek();
        }
      }

      // ビデオが変わったときに確実に自動再生させる
      // loadedmetadata イベント: ビデオのメタデータが読み込まれたとき
      const handleLoadedMetadata = () => {
        if (dp.video) {
          // メタデータ読み込み後に再生を開始
          // スマホのブラウザでは、ユーザー操作なしでの自動再生が制限されてしまう・・・
          const playPromise = dp.video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('[DPlayer] Auto-play started successfully');
              })
              .catch((error) => {
                console.warn('[DPlayer] Auto-play failed:', error);
              });
          }
        }
      };

      if (dp.video) {
        dp.video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }

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

      // ──────────────────────────────────────────────────────────────
      // 視聴履歴機能の初期化
      // ──────────────────────────────────────────────────────────────

      // 視聴履歴更新の時刻を記録（タイムアウト防止用）
      let lastWatchedHistoryUpdateTime = 0;

      // 再生開始時にイベントを発送したかを追跡
      let playStartEventEmitted = false;

      // 再生時間更新イベントをリッスン
      const handleTimeUpdate = () => {
        if (!dp.video) return;

        // 最初の timeupdate イベントで再生開始を通知（App.tsx へ）
        if (!playStartEventEmitted && videoIdRef.current) {
          playStartEventEmitted = true;
          window.dispatchEvent(
            new CustomEvent('dplayer-video-play-start', {
              detail: { videoId: videoIdRef.current },
            })
          );
          console.log(
            `[DPlayer] Video play start event dispatched. (Video ID: ${videoIdRef.current})`
          );
        }

        // onCurrentTimeChange コールバックがあれば実行
        if (onCurrentTimeChange) {
          onCurrentTimeChange(dp.video.currentTime);
        }

        // ─────────────────────────────────────────
        // 視聴履歴の更新処理（一定間隔で間引く）
        // 既存の視聴履歴がある場合のみ再生位置を更新
        // ─────────────────────────────────────────
        const now = new Date().getTime();
        if (now - lastWatchedHistoryUpdateTime >= WATCHED_HISTORY_UPDATE_INTERVAL * 1000) {
          lastWatchedHistoryUpdateTime = now;

          if (!videoIdRef.current) {
            return;
          }

          const currentTime = dp.video.currentTime;
          const videoId = videoIdRef.current;

          // 現在の設定を取得
          const { settings: currentSettings, updateSettings } = useSettingsStore.getState();
          const watchedHistory = Array.isArray(currentSettings.watched_history)
            ? currentSettings.watched_history
            : [];

          // 視聴履歴から該当の動画を検索
          const historyIndex = watchedHistory.findIndex(
            (history: any) => history.video_id === videoId
          );

           // 視聴履歴が既に登録されている場合のみ、再生位置を更新
           if (historyIndex !== -1) {
             const updatedHistory = [...watchedHistory];
             updatedHistory[historyIndex] = {
               ...updatedHistory[historyIndex],
               last_playback_position: currentTime,
               jikkyo_comment_offset: Math.floor(delayOffsetRef.current),
               updated_at: Math.floor(Date.now() / 1000), // 秒単位
             };

             updateSettings({ watched_history: updatedHistory });

             console.log(
               `[DPlayer] Last playback position updated. (Video ID: ${videoId}, last_playback_position: ${currentTime}, jikkyo_comment_offset: ${delayOffsetRef.current})`
             );
           }
        }
      };

      // 動画終了時のイベントリスナー
      const handleVideoEnded = async () => {
        console.log('[DPlayer] Video ended');
        // 次の動画への遷移ロジック（currentVideoがセットされている場合）
        if (currentVideo?.series_id && currentVideo?.episode) {
          try {
            // シリーズデータを取得して次の動画IDを計算
            const seriesId = currentVideo.series_id;
            const currentEpisode = currentVideo.episode;
            
            // OpenAPI生成コードを使用してシリーズデータを取得
            const seriesApi = new SeriesApi();
            const response = await seriesApi.apiV1SeriesIdGet(seriesId);
            
            const seriesData = response.data;
            const videos = seriesData?.videos ?? [];
            
            if (videos.length > 0) {
              // エピソード番号でソート（昇順）
              const sortedVideos = [...videos].sort((a: any, b: any) => {
                const episodeA = a.episode ?? Number.MAX_VALUE;
                const episodeB = b.episode ?? Number.MAX_VALUE;
                return episodeA - episodeB;
              });

              // 現在のエピソードのインデックスを検索
              const currentIndex = sortedVideos.findIndex((v: any) => v.episode === currentEpisode);

              if (currentIndex !== -1) {
                // 次の動画を取得（最後の場合は最初に戻す）
                const nextIndex = (currentIndex + 1) % sortedVideos.length;
                const nextVideo = sortedVideos[nextIndex];

                if (nextVideo?.id) {
                  console.log('[DPlayer] Navigating to next video:', nextVideo.id);
                  window.location.href = `/videos/${nextVideo.id}`;
                  dp.video.play();
                }
              }
            }
          } catch (error) {
            console.error('[DPlayer] Error handling video end:', error);
          }
        }
      };

      if (dp.video) {
        dp.video.addEventListener('timeupdate', handleTimeUpdate);
        dp.video.addEventListener('ended', handleVideoEnded);
      }

      // クリーンアップ関数を保存
      DPlayerRef.current._cleanup = () => {
        if (dp.video) {
          dp.video.removeEventListener('timeupdate', handleTimeUpdate);
          dp.video.removeEventListener('ended', handleVideoEnded);
        }

        // リスナーをクリーンアップ
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handlePlayerTap);
          containerRef.current.removeEventListener('touchstart', handlePlayerTap);
        }
        document.removeEventListener('click', handleOutsideClick);
      };
    });

    return () => {
      cancelled = true;
      DPlayerRef.current?._cleanup?.();
      DPlayerRef.current?.destroy();
      DPlayerRef.current = null;
    };
  }, [src, videoId, onCurrentTimeChange, toggleHeaderVisibility, hideHeader, initialPlaybackPosition]);

  // delayOffset が変わったらコメント位置を再同期
  useEffect(() => {
    if (DPlayerRef.current?.danmaku) {
      DPlayerRef.current.danmaku.options.time = () => DPlayerRef.current.video.currentTime - delayOffset;
      DPlayerRef.current.danmaku.seek();
    }
  }, [delayOffset]);

  // 初期再生位置へシーク
  useEffect(() => {
    if (DPlayerRef.current?.video && initialPlaybackPosition !== undefined && initialPlaybackPosition > 0) {
      DPlayerRef.current.video.currentTime = initialPlaybackPosition;
      // コメント表示位置を同期
      if (DPlayerRef.current?.danmaku) {
        DPlayerRef.current.danmaku.seek();
      }
    }
  }, [initialPlaybackPosition]);

  // URLが変わったときにdplayerを再生
  useEffect(() => {
    if (src && DPlayerRef.current?.video) {
      const playPromise = DPlayerRef.current.video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[DPlayer] Auto-play started after src change');
          })
          .catch((error: any) => {
            console.warn('[DPlayer] Auto-play failed after src change:', error);
            // 自動再生が失敗した場合はユーザーインタラクションを待つ
          });
      }
    }
  }, [src]);

  return (
    <div className="dplayer-container-wrapper group relative max-w-280 flex  mx-auto h-full">
      {/* ビデオヘッダー */}
      {/*<VideoHeader
        title={videoTitle}
        programTime={programTime}
      />*/}
      {/* DPlayer はこの div に直接マウントされる */}
      <div ref={containerRef} className="dplayer-container" />
    </div>
  );
}

/**
 * 実装完了: 視聴履歴機能（責任分離版）
 * 
 * 以下の処理が実装されました：
 * 1. 再生開始通知: 最初の timeupdate で App.tsx へ dplayer-video-play-start イベントを発送
 * 2. 再生位置の更新: timeupdate イベントを WATCHED_HISTORY_UPDATE_INTERVAL 秒ごとに間引いて
 *    既存の視聴履歴の再生位置を更新（App.tsx が追加した履歴に限定）
 * 3. クリーンアップ: コンポーネントのアンマウント時にイベントリスナーをクリア
 * 
 * 【責任分離】
 * - DPlayer.tsx: 再生位置の更新と再生開始の通知のみを担当
 * - App.tsx: 視聴開始検出、履歴への新規追加、件数管理を担当
 *   このアプローチにより、App.tsx の既存処理との競合を回避
 */
