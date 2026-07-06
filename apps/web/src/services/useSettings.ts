import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsApi, type DtoClientSettingsDTO } from "@/generated";
import { useSettingsStore } from "@/stores/settings-store";
import { apiConfiguration } from "@/lib/api/api-config";

// APIクライアントのセットアップ（共通設定を使用）
const settingsApi = new SettingsApi(apiConfiguration);

/**
 * サーバーからクライアント設定を取得する（非-Hook）
 * @internal このサービスは内部使用のみ
 */
async function fetchClientSettings() {
  try {
    const response = await settingsApi.apiV1SettingsClientGet();
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * サーバーにクライアント設定を更新する（非-Hook）
 * @internal このサービスは内部使用のみ
 */
async function updateClientSettings(settings: DtoClientSettingsDTO) {
  const response = await settingsApi.apiV1SettingsClientPut(settings);
  return response.data;
}

/**
 * クライアント設定を取得するクエリ
 * 成功時にZustandストアに設定を保存
 */
export function useSettingsQuery(options?: any) {
  const { updateSettings, settings } = useSettingsStore();

  const query = useQuery<DtoClientSettingsDTO>({
    queryKey: ["settings"],
    queryFn: fetchClientSettings,
    staleTime: 1000 * 60 * 5, // 5分間のキャッシュ
    gcTime: 1000 * 60 * 10, // 10分でガベージコレクション
    ...options,
  });

  // enabledで制御しているためonSuceessが動作しないので、useEffectで代替
  // onSuccess を useEffect 外で実行するための処理
  // サーバーから取得したデータをローカル設定とマージ
  // ローカルで同期待機中の値（特に mylist や watched_history など）を優先保持する
  React.useEffect(() => {
    if (query.status === "success" && query.data) {
      // サーバーのデータとローカルの現在値をマージ
      // ローカルの値が存在する場合はそちらを優先
      const mergedSettings = {
        ...query.data,
        // ローカルのマイリストが存在し、かつ配列なら優先
        mylist: Array.isArray(settings.mylist) && settings.mylist.length > 0 
          ? settings.mylist 
          : query.data.mylist,
      };
      updateSettings(mergedSettings);
    }
  }, [query.status, query.data, updateSettings, settings.mylist]);

  // onError を useEffect 外で実行するための処理
  React.useEffect(() => {
    if (query.status === "error" && query.error) {
      console.error("Failed to fetch settings:", query.error);
    }
  }, [query.status, query.error]);

  return query;
}

/**
 * クライアント設定を更新するミューテーション
 */
export function useUpdateSettingsMutation(options?: any) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientSettings,
    onSuccess: () => {
      // 設定キャッシュを無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update settings:", error);
    },
    ...options,
  });
}
