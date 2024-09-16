import { Move, Square } from "chess.js";

import { PieceUpdatePayload } from "./piece.interface";
import { BoardCoord } from "./board.interface";

export interface EnginePieceUpdatePayload extends PieceUpdatePayload {
	pgnSquare: Square;
	possibleMoves: Move[];
	possibleCoords: BoardCoord[];
}
