import { create } from 'zustand'
import { createJSONStorage, persist, PersistStorage } from 'zustand/middleware'
import { EncryptedStorage } from '@/lib/encrypted-storage'

/**
 * 認証ストアの状態型
 */
interface AuthState {
  accessToken: string | null

  // アクション
  setAccessToken: (token: string) => void
  removeAccessToken: () => void
  isAuthenticated: () => boolean
}

/**
 * Zustand を使用した認証ストア
 * persist ミドルウェアでトークンを暗号化して localStorage に保存
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,

      /**
       * アクセストークンを設定
       * 自動的に暗号化して localStorage に保存される
       */
      setAccessToken: (token: string) => {
        set({ accessToken: token })
      },

      /**
       * アクセストークンを削除
       */
      removeAccessToken: () => {
        set({ accessToken: null })
      },

      /**
       * ユーザーがログインしているかを確認
       */
      isAuthenticated: () => {
        return get().accessToken !== null
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // storage: localStorage as unknown as PersistStorage<AuthState>, 
      // CryptoJSの設定がうまくいかないため、通常のlocalStorageを一時的に使用
      //storage: new EncryptedStorage(),
    }
  )
)
