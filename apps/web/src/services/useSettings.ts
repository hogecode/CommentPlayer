import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsApi, type DtoClientSettingsDTO } from "@/generated";
import { useSettingsStore } from "@/stores/settings-store";

// APIクライアントのセットアップ
const settingsApi = new SettingsApi();

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
  const { updateSettings } = useSettingsStore();

  const query = useQuery<DtoClientSettingsDTO>({
    queryKey: ["settings"],
    queryFn: fetchClientSettings,
    staleTime: 1000 * 60 * 5, // 5分間のキャッシュ
    gcTime: 1000 * 60 * 10, // 10分でガベージコレクション
    ...options,
  });

  // enabledで制御しているためonSuceessが動作しないので、useEffectで代替
  // onSuccess を useEffect 外で実行するための処理
  React.useEffect(() => {
    if (query.status === "success" && query.data) {
      updateSettings(query.data);
    }
  }, [query.status, query.data, updateSettings]);

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
