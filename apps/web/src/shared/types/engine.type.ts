import { Move, Square } from "chess.js";
import { PieceNotificationPayload } from "@chess-d/chessboard";
import { BoardCoord, GameUpdatedPayload } from "@chess-d/shared";

import { MessageData } from "./events.type";
import { TransferableChessData } from "./chess.type";

export type EngineUpdatedMessageData = MessageData<
	GameUpdatedPayload &
		TransferableChessData & { history: Move[]; redoHistory: Move[] }
>;

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
