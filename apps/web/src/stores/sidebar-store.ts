"use client";

import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

export interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    {
      name: "sidebar-storage",
      storage: localStorage as unknown as PersistStorage<SidebarState>, 
    }
  )
);
