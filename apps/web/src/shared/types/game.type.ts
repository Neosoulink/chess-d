import { ColorSide, GameUpdatedPayload } from "@chess-d/shared";
import { Move } from "chess.js";

import { MoveLike, TransferableChessData } from "./chess.type";

export type GameState = GameUpdatedPayload &
	TransferableChessData & {
		history: Move[];
		redoHistory: MoveLike[];
		playerSide: ColorSide;
		startSide: ColorSide;
	};

export interface GameResetState {
	fen?: string;
	pgn?: string;
	redoHistory?: MoveLike[];
	playerSide?: ColorSide;
	startSide?: ColorSide;
}
