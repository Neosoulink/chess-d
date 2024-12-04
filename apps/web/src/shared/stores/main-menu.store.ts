import { create } from "zustand";
import { MainMenuSection } from "../enum";
import { Properties } from "@quick-threejs/utils";

export interface MainMenuStore {
	isOpen: boolean;
	currentSection: MainMenuSection;
	open: (section?: MainMenuSection) => void;
	close: () => void;
	setSection: (section: MainMenuSection) => void;
	reset: () => void;
}

export const mainMenuInitialState: Properties<MainMenuStore> = {
	isOpen: false,
	currentSection: MainMenuSection.main
};

export const useMainMenuStore = create<MainMenuStore>((set) => ({
	...mainMenuInitialState,
	open: (section = MainMenuSection.main) =>
		set(() => ({ isOpen: true, currentSection: section })),
	close: () => set(() => ({ isOpen: false })),
	setSection: (section: MainMenuSection) =>
		set(() => ({ currentSection: section })),
	reset: () =>
		set((currentState) => ({ ...currentState, ...mainMenuInitialState }))
}));
