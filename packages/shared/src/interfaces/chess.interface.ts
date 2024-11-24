import { Color, Move } from "chess.js";

export type GameUpdatedPayload = {
	turn: Color;
	fen: string;
	move?: Move;
};
