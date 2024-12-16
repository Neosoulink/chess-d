import { Color, Move, PieceSymbol } from "chess.js";

export interface GameUpdatedPayload {
	turn: Color;
	fen: string;
	move?: Move;
}

export type ExtendedPieceSymbol = PieceSymbol | Capitalize<PieceSymbol>;
