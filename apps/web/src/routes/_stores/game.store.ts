import { create } from "zustand";
import { RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";

export interface GameStore {
	app?: RegisterModule;
	reset: () => void;
	setApp: (app: RegisterModule | undefined) => void;
}

export const gameInitialState: Properties<GameStore> = { app: undefined };

export const useGameStore = create<GameStore>((set) => ({
	...gameInitialState,
	reset: () => set(() => ({ ...gameInitialState })),
	setApp: (app?: RegisterModule) => set(() => ({ app }))
}));
