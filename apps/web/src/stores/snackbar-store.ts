import { create } from 'zustand'

export type SnackbarLevel = 'success' | 'warning' | 'error' | 'info' | 'default'

export interface Snackbar {
  id: string
  level: SnackbarLevel
  text: string
  showing: boolean
  destroying: boolean
}

interface SnackbarStoreState {
  snackbars: Snackbar[]
  show: (level: SnackbarLevel, text: string, timeout?: number) => void
  hide: (id: string) => Promise<void>
}

// ユーティリティ関数
const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

export const useSnackbarStore = create<SnackbarStoreState>((set, get) => ({
  snackbars: [],

  /**
   * 指定されたレベルとテキストでスナックバーを表示する
   * 同じレベルとテキストの表示中のスナックバーがある場合は追加しない
   * @param level スナックバーのレベル
   * @param text スナックバーに表示するテキスト
   * @param timeout スナックバーを表示する秒数（デフォルトは 5 秒）
   */
  show: async (level: SnackbarLevel, text: string, timeout: number = 5.0) => {
    // 同じレベルとテキストで既に表示されているスナックバーがあるかチェック
    const isDuplicate = get().snackbars.some(
      (s) => s.level === level && s.text === text && s.showing
    )

    if (isDuplicate) {
      return // 重複している場合は何もしない
    }

    // スナックバーを一意のIDで作成
    const id = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, v) => acc + v.toString(16), '')

    const newSnackbar: Snackbar = {
      id,
      level,
      text,
      showing: false,
      destroying: false,
    }

    // スナックバーをスタックに追加
    set((state) => ({
      snackbars: [...state.snackbars, newSnackbar],
    }))

    // 少し待ってからすぐに表示する
    await sleep(0.05) // 少し待たないと表示時の CSS アニメーションが発生しない

    set((state) => ({
      snackbars: state.snackbars.map((s) =>
        s.id === id ? { ...s, showing: true } : s
      ),
    }))

    // タイムアウト秒が終わったら非表示にする
    await sleep(timeout)
    await get().hide(id)
  },

  /**
   * スナックバーを非表示にして削除する
   * @param id スナックバーの ID
   */
  hide: async (id: string) => {
    const snackbar = get().snackbars.find((s) => s.id === id)

    // すでに非表示になっている場合は何もしない
    if (!snackbar || !snackbar.showing) {
      return
    }

    // 非表示にする
    set((state) => ({
      snackbars: state.snackbars.map((s) =>
        s.id === id ? { ...s, showing: false } : s
      ),
    }))

    // 非表示時の CSS アニメーション (0.2 秒)
    await sleep(0.2)

    // 自身の height を 0px にしてなめらかにスタックの空白を詰める CSS アニメーション (0.3 秒)
    set((state) => ({
      snackbars: state.snackbars.map((s) =>
        s.id === id ? { ...s, destroying: true } : s
      ),
    }))

    await sleep(0.3)

    // アニメーションが終わったら自身を配列から削除する
    await sleep(0.1)

    set((state) => ({
      snackbars: state.snackbars.filter((s) => s.id !== id),
    }))
  },
}))
