import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsApi, type DtoClientSettingsDTO } from "@/generated";

// APIクライアントのセットアップ
const settingsApi = new SettingsApi();

/**
 * サーバーからクライアント設定を取得する（非-Hook）
 * @internal このサービスは内部使用のみ
 */
async function fetchClientSettings() {
  const response = await settingsApi.apiV1SettingsClientGet();
  return response.data;
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
 */
export function useSettingsQuery(options?: any) {
  return useQuery<DtoClientSettingsDTO>({
    queryKey: ["settings"],
    queryFn: fetchClientSettings,
    staleTime: 1000 * 60 * 5, // 5分間のキャッシュ
    gcTime: 1000 * 60 * 10, // 10分でガベージコレクション
    ...options,
  });
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
    onError: (error) => {
      console.error("Failed to update settings:", error);
    },
    ...options,
  });
}
