import { Chess } from "chess.js";
import { inject, singleton } from "tsyringe";
import {
	CoreModule as ChessboardModule,
	getOppositeColor,
	MatrixPieceModel,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "@chess-d/chessboard";

import { EngineController } from "./engine.controller";

@singleton()
export class EngineService {
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule
	) {}

	public getTurn() {
		return this.game.turn();
	}

	public getFen() {
		return this.game.fen();
	}

	public handlePieceMoved(
		payload: ObservablePayload<EngineController["pieceMoved$"]>
	) {
		const { piece, startCoord, endCoord, nextMoveIndex, nextMove } = payload;
		const flags = nextMove?.flags as MoveFlags;
		const oppositeColor = getOppositeColor(piece.color);

		let pieceToDrop: MatrixPieceModel | undefined = undefined;

		if (!endCoord || !(nextMoveIndex >= 0) || !nextMove)
			return this.chessboard.pieces.component.movePieceByCoord(
				piece,
				startCoord
			);

		if (nextMove.captured)
			pieceToDrop = this.chessboard.pieces.component.getPieceByCoord(
				nextMove.captured as PieceType,
				oppositeColor,
				nextMove.flags === "e"
					? {
							...endCoord,
							row: endCoord.row + (nextMove.color === "w" ? -1 : 1)
						}
					: endCoord
			);

		if (
			flags === MoveFlags.kingside_castle ||
			flags === MoveFlags.queenside_castle
		) {
			const rockCoord = {
				...endCoord,
				col: flags === MoveFlags.queenside_castle ? 0 : 7
			};
			const rock = this.chessboard.pieces.component.getPieceByCoord(
				PieceType.rock,
				piece.color,
				rockCoord
			);

			if (rock) {
				const newRockCoord = {
					...endCoord,
					col: flags === MoveFlags.queenside_castle ? 3 : 5
				};

				this.chessboard.pieces.component.movePieceByCoord(rock, newRockCoord);
			}
		}

		if (pieceToDrop) {
			this.chessboard.pieces.component.dropPiece(pieceToDrop);
		}

		this.chessboard.pieces.component.movePieceByCoord(piece, endCoord);
		this.game.move(nextMove);

		if (nextMove.promotion && piece.type === PieceType.pawn) {
			this.chessboard.pieces.component.promotePiece(
				piece as MatrixPieceModel<PieceType.pawn, (typeof piece)["color"]>,
				nextMove.promotion as PieceType
			);
		}
	}

	public handlePieceSelected(
		payload: ObservablePayload<EngineController["pieceSelected$"]>
	) {
		const { possibleCoords } = payload;

		this.chessboard.board.component.setMarkers(possibleCoords);
	}
}
