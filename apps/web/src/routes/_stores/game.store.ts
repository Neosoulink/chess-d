import { create } from "zustand";
import { ContainerizedApp, RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";

export interface GameStore {
	app?: ContainerizedApp<RegisterModule>;
	reset: () => void;
	setApp: (app: ContainerizedApp<RegisterModule> | undefined) => void;
}

export const gameInitialState: Properties<GameStore> = { app: undefined };

export const useGameStore = create<GameStore>((set) => ({
	...gameInitialState,
	reset: () => set(() => ({ ...gameInitialState })),
	setApp: (app?: ContainerizedApp<RegisterModule>) => set(() => ({ app }))
}));
