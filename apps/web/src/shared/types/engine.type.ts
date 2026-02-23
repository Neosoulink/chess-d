import { Move, Square } from "chess.js";
import { PieceNotificationPayload } from "@chess-d/chessboard";
import { BoardCoord } from "@chess-d/shared";

import { MessageData } from "./events.type";
import { GameState } from "./game.type";

export type EngineUpdatedMessageData = MessageData<GameState>;

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
