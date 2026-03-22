import { useSnackbarStore } from '@/stores/snackbar-store'

/**
 * メッセージ表示ユーティリティ
 * Zustand ストアを使用してスナックバーを管理
 *
 * 使用例（コンポーネント内）：
 * import { useMessage } from '@/message'
 *
 * function MyComponent() {
 *   const { success, error } = useMessage()
 *   success('ログインしました')
 *   error('エラーが発生しました')
 * }
 *
 * 使用例（スタンドアロン）：
 * import Message from '@/message'
 * Message.success('ログインしました')
 */

export function useMessage() {
  const show = useSnackbarStore((state) => state.show)

  return {
    notifySuccess: (message: string, duration?: number) => {
      show('success', message, duration ?? 5)
    },
    notifyInfo: (message: string, duration?: number) => {
      show('info', message, duration ?? 5)
    },
    notifyWarning: (message: string, duration?: number) => {
      show('warning', message, duration ?? 5)
    },
    notifyError: (message: string, duration?: number) => {
      show('error', message, duration ?? 5)
    },
    notifyDefault: (message: string, duration?: number) => {
      show('default', message, duration ?? 5)
    },
  }
}

// スタンドアロン使用版
const Message = {
  success: (message: string, duration?: number) => {
    useSnackbarStore.getState().show('success', message, duration ?? 5)
  },
  info: (message: string, duration?: number) => {
    useSnackbarStore.getState().show('info', message, duration ?? 5)
  },
  warning: (message: string, duration?: number) => {
    useSnackbarStore.getState().show('warning', message, duration ?? 5)
  },
  error: (message: string, duration?: number) => {
    useSnackbarStore.getState().show('error', message, duration ?? 5)
  },
  show: (message: string, duration?: number) => {
    useSnackbarStore.getState().show('default', message, duration ?? 5)
  },
}

export default Message
