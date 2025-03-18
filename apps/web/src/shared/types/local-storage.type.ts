import { ColorSide } from "@chess-d/shared";

import { GameMode } from "../enum";
import { MoveLike } from "./chess.type";

export interface GameSave {
	date: string;
	fen: string;
	id: string;
	mode: GameMode;
	pgn: string;
	redoHistory?: MoveLike[];
	side: ColorSide;
}
