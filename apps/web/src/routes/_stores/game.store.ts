import { create } from "zustand";
import { ContainerizedApp, RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";
import { ObservablePayload } from "@chess-d/shared";
import { GameController } from "../../core/game/game.controller";

export interface GameStore {
	app?: ContainerizedApp<RegisterModule>;
	state: ObservablePayload<GameController["state$"]> | "loading";
	reset: () => void;
	setApp: (app: ContainerizedApp<RegisterModule> | undefined) => void;
	setState: (
		state: ObservablePayload<GameController["state$"]> | "loading"
	) => void;
}

export const gameInitialState: Properties<GameStore> = {
	app: undefined,
	state: "loading"
};

export const useGameStore = create<GameStore>((set) => ({
	...gameInitialState,
	reset: () => set(() => ({ ...gameInitialState })),
	setApp: (app?: ContainerizedApp<RegisterModule>) => set(() => ({ app })),
	setState: (state) => set(() => ({ state }))
}));
