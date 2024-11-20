import { Move, Square } from "chess.js";
import { PieceNotificationPayload } from "@chess-d/chessboard";
import { BoardCoord } from "@chess-d/shared";

export interface EngineNotificationPayload extends PieceNotificationPayload {
	pgnSquare: Square;
	possibleMoves: Move[];
	possibleCoords: BoardCoord[];
}
