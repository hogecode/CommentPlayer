"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localStorageStorage } from ".";

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
      storage: localStorageStorage, 
    }
  )
);
