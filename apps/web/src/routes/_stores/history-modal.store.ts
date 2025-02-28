import { create } from "zustand";
import { Properties } from "@quick-threejs/utils";

export interface historyModalStore {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	toggleOpen: () => void;
}

export const historyModalStoreInitialState: Properties<historyModalStore> = {
	isOpen: false
};

export const useHistoryModalStore = create<historyModalStore>((set, get) => ({
	...historyModalStoreInitialState,
	setIsOpen: (isOpen: boolean) => set(() => ({ isOpen })),
	toggleOpen: () => set((state) => ({ isOpen: !state.isOpen }))
}));
