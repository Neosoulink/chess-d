import { create } from "zustand";
import { ContainerizedApp, RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";
import { GAME_RESET_TOKEN, PIECE_WILL_MOVE_TOKEN } from "../../shared/tokens";
import { MessageData } from "../../shared/types";
import { DEFAULT_FEN } from "@chess-d/shared";
import { Move } from "chess.js";

export interface GameStore {
	app?: ContainerizedApp<RegisterModule>;
	fen?: string;
	isResourcesLoaded: boolean;
	setApp: (app?: ContainerizedApp<RegisterModule> | undefined) => void;
	setFen: (fen?: string) => void;
	setIsResourcesLoaded: (bool: boolean) => void;
	performPieceMove: (move: Move) => void;
	resetGame: () => void;
	reset: () => void;
}

export const gameStoreInitialState: Properties<GameStore> = {
	app: undefined,
	fen: undefined,
	isResourcesLoaded: false
};

export const useGameStore = create<GameStore>((set, get) => ({
	...gameStoreInitialState,
	setApp: (app) => set(() => ({ app })),
	setFen: (fen) => set(() => ({ fen })),
	setIsResourcesLoaded: (bool) => set(() => ({ isResourcesLoaded: bool })),
	performPieceMove: (move: Move) => {
		const appModule = get().app?.module;

		appModule?.getWorker()?.postMessage?.({
			token: PIECE_WILL_MOVE_TOKEN,
			value: move
		} satisfies MessageData<Move>);
	},
	resetGame: () => {
		const appModule = get().app?.module;
		const fen = get().fen;

		appModule?.getWorker()?.postMessage({
			token: GAME_RESET_TOKEN,
			value: { fen }
		} satisfies MessageData);
	},
	reset: () => set(() => ({ ...gameStoreInitialState }))
}));
