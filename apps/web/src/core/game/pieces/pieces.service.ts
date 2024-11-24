import { CoreModule as ChessCoreModule } from "@chess-d/chessboard";
import { ColorSide, PieceType, squareToCoord } from "@chess-d/shared";
import { Move } from "chess.js";
import { inject, singleton } from "tsyringe";

@singleton()
export class PiecesService {
	constructor(
		@inject(ChessCoreModule) private readonly chessboard: ChessCoreModule
	) {}

	handlePlayerMovedPiece(move: Move) {
		const piece = this.chessboard.pieces.component.getPieceByCoord(
			move.piece as PieceType,
			move.color as ColorSide,
			squareToCoord(move.from)
		)!;

		const cell = this.chessboard.board.component.instancedCell.getCellByCoord(
			squareToCoord(move.to)
		)!;
		const startCoord = squareToCoord(move.from);
		const endCoord = squareToCoord(move.to);

		this.chessboard.pieces.controller.pieceDeselected$$.next({
			piece,
			cell,
			startPosition: piece.position,
			startCoord,
			startSquare: move.from,
			endCoord,
			endSquare: move.to
		});
	}
}
