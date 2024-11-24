import { Color, Move, Square } from "chess.js";
import { PieceNotificationPayload } from "@chess-d/chessboard";
import { BoardCoord, GameUpdatedPayload } from "@chess-d/shared";

import { MessageEventPayload } from "./events.type";

export type EngineGameUpdatedMessageEventPayload =
	MessageEventPayload<GameUpdatedPayload>;

export interface EngineNotificationPayload extends PieceNotificationPayload {
	pgnSquare: Square;
	possibleMoves: Move[];
	possibleCoords: BoardCoord[];
}

export interface EnginePieceMovedNotificationPayload
	extends EngineNotificationPayload {
	nextMoveIndex: number;
	nextMove?: Move;
}
