import { Move, Square } from "chess.js";

import { PieceNotificationPayload } from "./piece.interface";
import { BoardCoord } from "./board.interface";

export interface EngineNotificationPayload extends PieceNotificationPayload {
	pgnSquare: Square;
	possibleMoves: Move[];
	possibleCoords: BoardCoord[];
}
