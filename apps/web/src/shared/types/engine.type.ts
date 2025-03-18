import { Move, Square } from "chess.js";
import { PieceNotificationPayload } from "@chess-d/chessboard";
import { BoardCoord, GameUpdatedPayload } from "@chess-d/shared";

import { MessageData } from "./events.type";
import { MoveLike, TransferableChessData } from "./chess.type";

export type EngineGameState = GameUpdatedPayload &
	TransferableChessData & { history: Move[]; redoHistory: MoveLike[] };

export interface EngineResetGameState {
	fen?: string;
	pgn?: string;
	redoHistory?: MoveLike[];
}

export type EngineUpdatedMessageData = MessageData<EngineGameState>;

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
