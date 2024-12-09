import { create } from "zustand";
import { RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";

export interface GameStore {
	app?: RegisterModule;
	setApp: (app?: RegisterModule) => void;
}

export const gameInitialState: Properties<GameStore> = {};

export const useGameStore = create<GameStore>((set) => ({
	...gameInitialState,
	setApp: (app?: RegisterModule) => set(() => ({ app }))
}));
