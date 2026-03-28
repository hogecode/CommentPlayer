/**
 * ビデオプレイヤーのヘッダー表示/非表示状態を管理するZustandストア
 */

import { create } from "zustand";

interface PlayerHeaderState {
  isVisible: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  showHeader: () => void;
  hideHeader: () => void;
}

export const usePlayerHeaderStore = create<PlayerHeaderState>((set, get) => ({
  isVisible: false,
  timer: null,

  showHeader: () => {
    const { isVisible, timer } = get();

    // 既存タイマーをクリア（連打対策）
    if (timer) {
      clearTimeout(timer);
    }

      const newTimer = setTimeout(() => {
        set({ isVisible: false, timer: null });
      }, 3000);

      set({ isVisible: true, timer: newTimer });
    },

  hideHeader: () => {
    const { timer } = get();
    if (timer) clearTimeout(timer);

    set({ isVisible: false, timer: null });
  },
}));
