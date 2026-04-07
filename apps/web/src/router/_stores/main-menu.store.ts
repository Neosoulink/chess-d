import { create } from "zustand";
import { Properties } from "@quick-threejs/utils";

export interface MainMenuStore {
	isOpen: boolean;
	currentSections?: string[];
	setOpen: (isOpen: boolean) => void;
	setSections: (sections: string | string[]) => void;
	toggleOpen: () => void;
	reset: () => void;
}

export const mainMenuInitialState: Properties<MainMenuStore> = {
	isOpen: false
};

export const useMainMenuStore = create<MainMenuStore>((set) => ({
	...mainMenuInitialState,
	setOpen: (isOpen: boolean) => set(() => ({ isOpen })),
	setSections: (currentSections: string | string[]) =>
		set(() => ({
			currentSections: Array.isArray(currentSections)
				? currentSections
				: [currentSections]
		})),
	toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
	reset: () => set(mainMenuInitialState)
}));
