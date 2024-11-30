import { create } from "zustand";

export interface MainMenuStore {
	isMenuOpen: boolean;
	isNewGameSectionOpen: boolean;
	closeMenu: () => void;
	openMenu: () => void;
	openNewGameSection: () => void;
	closeNewGameSection: () => void;
}

export const useMainMenuStore = create<MainMenuStore>((set) => ({
	isMenuOpen: false,
	isNewGameSectionOpen: false,
	openMenu: () => set(() => ({ isMenuOpen: true })),
	closeMenu: () => set(() => ({ isMenuOpen: false })),
	openNewGameSection: () => set(() => ({ isNewGameSectionOpen: true })),
	closeNewGameSection: () => set(() => ({ isNewGameSectionOpen: false }))
}));
