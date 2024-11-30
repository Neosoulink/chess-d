import { create } from "zustand";
import { GameMode } from "../enum/game.enum";

export interface GameStore {
	mode?: GameMode;
	setMode: (mode: GameMode) => void;
}

export const useGameStore = create<GameStore>((set) => ({
	mode: undefined,
	setMode: (mode) => set(() => ({ mode }))
}));
