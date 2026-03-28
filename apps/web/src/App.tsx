import { useEffect, useRef } from "react";
import { useRegisterSW } from "@/hooks/useRegisterSW";
import { useSettingsStore } from "@/stores/settings-store";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/services/useSettings";
import Message from "@/message";
import { sleep } from "@/lib/utils";
import { hashClientSettings } from "@/lib/settings";
import { initializeApiClient } from "@/lib/api/api-setup";

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
        (history: unknown) => !removeTargets.has(history),
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
