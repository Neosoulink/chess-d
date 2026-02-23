import { ColorSide } from "@chess-d/shared";
import { ContainerizedApp, RegisterModule } from "@quick-threejs/reactive";
import { Properties } from "@quick-threejs/utils";
import { Move, validateFen } from "chess.js";
import { create } from "zustand";

import {
	GAME_RESET_TOKEN,
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../shared/tokens";
import {
	EngineUpdatedMessageData,
	GameResetState,
	GameSave,
	GameState,
	MessageData
} from "../../shared/types";
import { getGameModeFromUrl } from "../../shared/utils";
import { SupportedSaveSlots } from "../../shared/enum";

export interface GameStore {
	app?: ContainerizedApp<RegisterModule>;
	initialGameState?: GameResetState;
	gameState?: GameState;
	isResourcesLoaded: boolean;
	playerSide: ColorSide;
	setApp: (app?: ContainerizedApp<RegisterModule> | undefined) => void;
	setInitialGameState: (state?: GameResetState) => void;
	setGameState: (state?: GameState) => void;
	setIsResourcesLoaded: (bool: boolean) => void;
	setPlayerSide: (side: ColorSide) => void;
	performPieceMove: (move: Move) => void;
	resetGame: () => void;
	getSaves: () => (GameSave | undefined)[];
	saveState: (slot: SupportedSaveSlots) => undefined | GameSave;
	eraseStateSave: (slot: SupportedSaveSlots) => void;
	reset: () => void;
}

export const gameStoreInitialState: Properties<GameStore> = {
	app: undefined,
	initialGameState: undefined,
	gameState: undefined,
	isResourcesLoaded: false,
	playerSide: ColorSide.white
};

/** @internal */
const getSaves = () => {
	let saves: (GameSave | undefined)[] = [];

	try {
		const rawSaves = JSON.parse(localStorage.getItem("game-saves") || "");

		if (Array.isArray(rawSaves)) saves = rawSaves;
	} catch {
		// do nothing...
	}

	return saves;
};

export const useGameStore = create<GameStore>((set, get) => {
	const setGameState: GameStore["setGameState"] = (state) => {
		if (validateFen(state?.fen || "").ok) set(() => ({ gameState: state }));
	};

	const handleAppMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
		const token = e.data?.token;

		if (token === GAME_UPDATED_TOKEN && e.data?.value) {
			setGameState(e.data.value);
		}
	};

	return {
		...gameStoreInitialState,
		setApp: (app) => {
			const appWorker = app?.module?.getWorker() as Worker | undefined;
			appWorker?.removeEventListener("message", handleAppMessages);
			appWorker?.addEventListener("message", handleAppMessages);
			return set(() => ({ app }));
		},
		setInitialGameState: (state) => set(() => ({ initialGameState: state })),
		setIsResourcesLoaded: (bool) => set(() => ({ isResourcesLoaded: bool })),
		setGameState,
		setPlayerSide: (playerSide) => set(() => ({ playerSide })),
		getSaves,
		saveState: (slot) => {
			const state = get().gameState;
			const gameMode = getGameModeFromUrl();
			const now = new Date().toISOString();
			const saves = getSaves();

			if (state && gameMode)
				saves[slot] = {
					date: now,
					fen: state.fen,
					mode: gameMode,
					id: `save-${slot}-${now}`,
					pgn: state.pgn,
					redoHistory: state.redoHistory,
					side: state.turn as ColorSide
				};

			localStorage.setItem("game-saves", JSON.stringify(saves));

			return saves[slot];
		},
		eraseStateSave: (slot) => {
			const saves = getSaves();

			saves[slot] = undefined;

			localStorage.setItem("game-saves", JSON.stringify(saves));
		},
		performPieceMove: (move: Move) => {
			const appModule = get().app?.module;

			appModule?.getWorker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageData<Move>);
		},
		resetGame: () => {
			const appModule = get().app?.module;
			const state = get().initialGameState;

			appModule?.getWorker()?.postMessage({
				token: GAME_RESET_TOKEN,
				value: state
			} satisfies MessageData);

			set(() => ({ initialGameState: undefined }));
		},
		reset: () => {
			const appWorker = get().app?.module?.getWorker() as Worker | undefined;
			appWorker?.removeEventListener("message", handleAppMessages);

			return set(() => ({ ...gameStoreInitialState }));
		}
	};
});
