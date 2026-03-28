'use client'

import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { UsersApi, type DtoUserCreateRequest } from '@/generated'
import { useNavigate } from '@tanstack/react-router'
import { useSnackbarStore } from '@/stores/snackbar-store'

/**
 * ユーザー登録用の Zod スキーマ
 */
export const registerUserSchema = z
  .object({
    username: z
      .string()
      .min(1, 'ユーザー名は必須です')
      .min(3, 'ユーザー名は3文字以上である必要があります'),
    password: z
      .string()
      .min(1, 'パスワードは必須です')
      .min(8, 'パスワードは8文字以上である必要があります'),
    confirmPassword: z
      .string()
      .min(1, '確認用パスワードは必須です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type RegisterUserInput = z.infer<typeof registerUserSchema>

// APIクライアントのセットアップ
const usersApi = new UsersApi()

/**
 * ユーザー登録用のカスタムフック
 * React Query の useMutation を使用してユーザー登録をハンドル
 * OpenAPI生成ファイル（UsersApi）を使用
 */
export function useRegisterUserMutation() {
  const navigate = useNavigate()
  const show = useSnackbarStore((state) => state.show)

  return useMutation({
    mutationFn: async (data: RegisterUserInput) => {
      const payload: DtoUserCreateRequest = {
        username: data.username,
        password: data.password,
        confirm_password: data.confirmPassword,
      }
      const response = await usersApi.apiV1UsersPost(payload)
      return response.data
    },
    onSuccess: async () => {
      await show('success', 'ユーザー登録が完了しました。')
      navigate({ to: '/' })
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || 'ユーザー登録に失敗しました'
      show('error', errorMessage)
      console.error('ユーザー登録エラー:', error)
    },
  })
}
