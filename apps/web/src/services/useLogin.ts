'use client'

import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { UsersApi, type DtoUserAccessTokenRequest } from '@/generated'
import { useNavigate } from '@tanstack/react-router'
import { useSnackbarStore } from '@/stores/snackbar-store'
import { useAuthStore } from '@/stores/auth-store'

/**
 * ユーザーログイン用の Zod スキーマ
 */
export const loginUserSchema = z.object({
  username: z
    .string()
    .min(1, 'ユーザー名は必須です')
    .min(3, 'ユーザー名は3文字以上である必要があります'),
  password: z
    .string()
    .min(1, 'パスワードは必須です')
    .min(8, 'パスワードは8文字以上である必要があります'),
})

export type LoginUserInput = z.infer<typeof loginUserSchema>

// APIクライアントのセットアップ
const usersApi = new UsersApi()

/**
 * ユーザーログイン用のカスタムフック
 * React Query の useMutation を使用してユーザーログインをハンドル
 * OpenAPI生成ファイル（UsersApi）を使用
 */
export function useLoginUserMutation() {
  const navigate = useNavigate()
  const show = useSnackbarStore((state) => state.show)

  return useMutation({
    mutationFn: async (data: LoginUserInput) => {
      const payload: DtoUserAccessTokenRequest = {
        username: data.username,
        password: data.password,
      }
      const response = await usersApi.apiV1UsersTokenPost(payload)
      return response.data
    },
    onSuccess: async (data) => {
      // トークンをZustandストアに保存（自動的に暗号化して localStorage に保存）
      if (data?.access_token) {
        const { setAccessToken } = useAuthStore.getState()
        setAccessToken(data.access_token)
      }
      
      await show('success', 'ログインしました。')
      navigate({ to: '/' })
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || 'ログインに失敗しました'
      show('error', errorMessage)
      console.error('ログインエラー:', error)
    },
  })
}
