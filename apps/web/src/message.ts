import { useSnackbarStore } from '@/stores/snackbar-store'

/**
 * メッセージ表示ユーティリティ
 * Zustand ストアを使用してスナックバーを管理
 *
 * 使用例（コンポーネント内）：
 * import Message from '@/message'
 * Message.success('ログインしました')
 */

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
