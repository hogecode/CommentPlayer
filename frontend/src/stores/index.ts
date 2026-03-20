import { PersistStorage } from "zustand/middleware";
import { SidebarState } from "./sidebar-store";


// localStorage を PersistStorage に変換
export const localStorageStorage: PersistStorage<SidebarState> = {
    getItem: (name) => {
        const value = localStorage.getItem(name);
        return value ? Promise.resolve(JSON.parse(value)) : Promise.resolve(null);
    },
    setItem: (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
        return Promise.resolve();
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
        return Promise.resolve();
    },
};

export * from './sidebar-store';