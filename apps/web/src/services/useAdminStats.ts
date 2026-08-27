import { useQuery } from '@tanstack/react-query'
import { AdminApi } from '@/generated'
import { apiConfiguration } from "@/lib/api/api-config";

const adminApi = new AdminApi(apiConfiguration)

/**
 * 管理画面統計データを取得
 * @param year - 年
 * @param month - 月（1-12）
 */
export function useAdminStatsQuery(year: number, month: number) {
  return useQuery({
    queryKey: ['admin-stats', year, month],
    queryFn: async () => {
      try {
        const response = await adminApi.apiV1AdminStatsMonthlyGet(year, month)
        return response.data
      } catch (error) {
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5分
  })
}
