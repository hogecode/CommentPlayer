import { create } from 'zustand'
import type { EntityCapture } from '@/generated'

interface CapturesState {
  // キャッシュされたキャプチャリスト
  captureList: EntityCapture[]
  
  // ソート情報
  sortKey: 'id' | 'created_at'
  sortOrder: 'asc' | 'desc'
  
  // ページング情報
  currentPage: number
  limit: number
  
  // シリーズ情報
  currentSeriesId: number | null
  
  // Actions
  setCaptureList: (captures: EntityCapture[]) => void
  setSortConfig: (sortKey: 'id' | 'created_at', sortOrder: 'asc' | 'desc') => void
  setPaginationInfo: (page: number, limit: number) => void
  addCaptures: (captures: EntityCapture[]) => void
  clearCaptureList: () => void
  setCurrentSeriesId: (seriesId: number | null) => void
}

export const useCapturesStore = create<CapturesState>((set) => ({
  captureList: [],
  sortKey: 'id',
  sortOrder: 'desc',
  currentPage: 1,
  limit: 24,
  currentSeriesId: null,

  setCaptureList: (captures) =>
    set({
      captureList: captures,
    }),

  setSortConfig: (sortKey, sortOrder) =>
    set({
      sortKey,
      sortOrder,
      // ソート変更時はページをリセット
      currentPage: 1,
    }),

  setPaginationInfo: (page, limit) =>
    set({
      currentPage: page,
      limit,
    }),

  addCaptures: (captures) =>
    set((state) => ({
      captureList: [...state.captureList, ...captures],
    })),

  clearCaptureList: () =>
    set({
      captureList: [],
      currentPage: 1,
    }),

  setCurrentSeriesId: (seriesId) =>
    set({
      currentSeriesId: seriesId,
      // シリーズ変更時はページをリセット
      currentPage: 1,
    }),
}))
