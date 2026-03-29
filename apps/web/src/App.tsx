import { useEffect, useRef } from "react";
import { useRegisterSW } from "@/hooks/useRegisterSW";
import { useSettingsStore } from "@/stores/settings-store";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/services/useSettings";
import Message from "@/message";
import { sleep } from "@/lib/utils";
import { hashClientSettings } from "@/lib/settings";
import { initializeApiClient } from "@/lib/api/api-setup";
import type { DtoWatchedHistoryItem } from "@/generated/models";

/**
 * 視聴履歴更新の間隔（秒）
 */
const WATCHED_HISTORY_UPDATE_INTERVAL = 10;

/**
 * 視聴開始から履歴に追加するまでの時間（秒）
 */
const WATCHED_HISTORY_THRESHOLD_SECONDS = 5;

/**
 * アプリケーション全体の初期化と Service Worker 管理を行うコンポーネント
 */
export function App() {
  // 設定ストアから必要な状態とアクションを取得
  const settings = useSettingsStore((state) => state.settings);
  const initializeSettings = useSettingsStore(
    (state) => state.initializeSettings,
  );
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  
  // React Query を使用した設定の同期
  const updateSettingsMutation = useUpdateSettingsMutation();
  const { refetch: refetchSettings } = useSettingsQuery();

  const isUpdatingWatchedHistoryRef = useRef(false);
  const previousSettingsHashRef = useRef("");

  // ──────────────────────────────────────────────────────────────
  // 視聴履歴管理用の状態
  // ──────────────────────────────────────────────────────────────
  /** 現在再生中の動画ID */
  const currentPlayingVideoIdRef = useRef<number | undefined>(undefined);
  /** 視聴開始時刻（Unix timestamp in ms） */
  const watchingStartTimeRef = useRef<number | undefined>(undefined);
  /** 視聴開始からのタイマーID */
  const watchHistoryThresholdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Service Worker の登録と更新イベントを管理
  useRegisterSW({
    onRegisteredSW(registration) {
      console.log("Service worker has been registered.");
    },
    onRegisterError(error) {
      console.error("Error during service worker registration:", error);
    },
    onOfflineReady() {
      console.log("Content has been cached for offline use.");
    },
    async onNeedRefresh() {
      console.log("New content is available; please refresh.");
      Message.show(
        "クライアントが新しいバージョンに更新されました。5秒後にリロードします。",
        10,
      );
      await sleep(5);
      window.location.reload();
    },
  });

  // アプリケーション起動時にAxiosのエラーインターセプターを設定したAPIクライアントを初期化
  initializeApiClient();

  // 設定を初期化
  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  
  // 設定データの変更を監視して LocalStorage に保存しサーバーに同期する
  useEffect(() => {
    // 視聴履歴の保持件数を変更した際に、既存の視聴履歴件数が上限を超えている場合は削除する
    const watchedHistoryMaxCount = Number.isFinite(
      settings.video_watched_history_max_count,
    )
      ? Math.max(1, Math.floor(settings.video_watched_history_max_count))
      : 1;
    const watchedHistory = Array.isArray(settings.watched_history)
      ? settings.watched_history
      : [];

    if (
      !isUpdatingWatchedHistoryRef.current &&
      watchedHistory.length > watchedHistoryMaxCount
    ) {
      const removeCount = watchedHistory.length - watchedHistoryMaxCount;
      const removeTargets = new Set(
        [...watchedHistory]
          .sort(
            (a, b) =>
              (a as Record<string, number>).updated_at -
              (b as Record<string, number>).updated_at,
          )
          .slice(0, removeCount),
      );

      const watchedHistoryTrimmed = watchedHistory.filter(
        (history: DtoWatchedHistoryItem) => !removeTargets.has(history),
      );

      isUpdatingWatchedHistoryRef.current = true;
      updateSettings({ watched_history: watchedHistoryTrimmed });
      isUpdatingWatchedHistoryRef.current = false;
      return;
    }

    // 設定データが変更されている場合は、サーバーに同期する
    // NOTE: persist ミドルウェアが自動的にローカルストレージに保存するため、
    // setLocalStorageSettings() の呼び出しは不要
    const currentHash = hashClientSettings(settings);
    if (previousSettingsHashRef.current !== currentHash) {
      console.log("Client Settings Changed");
      // ローカル設定をサーバーに同期する
      updateSettingsMutation.mutate(settings as any);
      previousSettingsHashRef.current = currentHash;
    }
  }, [settings, updateSettings, updateSettingsMutation]);

  // ──────────────────────────────────────────────────────────────
  // 動画再生開始イベントをリッスン（DPlayer からの通知）
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleVideoPlayStart = (event: Event) => {
      const customEvent = event as CustomEvent<{ videoId: number }>;
      const videoId = customEvent.detail?.videoId;

      if (!videoId) return;

      // 既に同じ動画が再生中の場合はタイマーをリセット
      if (currentPlayingVideoIdRef.current === videoId) {
        return;
      }

      // 前のタイマーをクリア
      if (watchHistoryThresholdTimerRef.current) {
        clearTimeout(watchHistoryThresholdTimerRef.current);
      }

      // 現在の再生動画を記録
      currentPlayingVideoIdRef.current = videoId;
      watchingStartTimeRef.current = Date.now();

      // 視聴開始から一定秒数後に視聴履歴に追加
      watchHistoryThresholdTimerRef.current = setTimeout(() => {
        if (!currentPlayingVideoIdRef.current) {
          return;
        }

        const videoIdToAdd = currentPlayingVideoIdRef.current;
        const { settings: currentSettings, updateSettings: updateSettingsNow } =
          useSettingsStore.getState();

        const watchedHistory = Array.isArray(currentSettings.watched_history)
          ? currentSettings.watched_history
          : [];

        // 視聴履歴から該当の動画を検索
        const historyIndex = watchedHistory.findIndex(
          (history: any) => history.video_id === videoIdToAdd
        );

        // まだ視聴履歴に存在しない場合のみ追加
        if (historyIndex === -1) {
          const videoWatchedHistoryMaxCount =
            currentSettings.video_watched_history_max_count;
          let updatedHistory = [...watchedHistory];

          // 視聴履歴が最大件数に達している場合は、最も古い履歴を削除
          if (updatedHistory.length >= videoWatchedHistoryMaxCount) {
            // 最も古い updated_at のタイムスタンプを持つ履歴を削除
            const oldestIndex = updatedHistory.reduce(
              (oldestIdx: number, current: any, idx: number, arr: any[]) => {
                return (current.updated_at || current.created_at) <
                  (arr[oldestIdx].updated_at || arr[oldestIdx].created_at)
                  ? idx
                  : oldestIdx;
              },
              0
            );
            updatedHistory.splice(oldestIndex, 1);
          }

          // 新しい視聴履歴を追加
          const now = Math.floor(Date.now() / 1000); // 秒単位
          updatedHistory.push({
            video_id: videoIdToAdd,
            last_playback_position: 0, // 初期値は0
            created_at: now,
            updated_at: now,
          });

          isUpdatingWatchedHistoryRef.current = true;
          updateSettingsNow({ watched_history: updatedHistory });
          isUpdatingWatchedHistoryRef.current = false;

          console.log(
            `[App] Watched history added. (Video ID: ${videoIdToAdd})`
          );
        }
      }, WATCHED_HISTORY_THRESHOLD_SECONDS * 1000);
    };

    window.addEventListener('dplayer-video-play-start', handleVideoPlayStart);

    return () => {
      window.removeEventListener('dplayer-video-play-start', handleVideoPlayStart);
      if (watchHistoryThresholdTimerRef.current) {
        clearTimeout(watchHistoryThresholdTimerRef.current);
      }
    };
  }, []);

  // ログイン時かつ設定の同期が有効な場合、30秒おきにサーバーから設定を取得する
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (settings.sync_settings === true) {
        // サーバーから設定を再フェッチする
        void refetchSettings();
      }
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, [settings.sync_settings, refetchSettings]);

  return null;
}
