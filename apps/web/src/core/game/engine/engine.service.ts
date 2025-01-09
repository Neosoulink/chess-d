import { Chess } from "chess.js";
import { inject, singleton } from "tsyringe";
import {
	CoreModule as ChessboardModule,
	MatrixPieceModel
} from "@chess-d/chessboard";
import {
	getOppositeColorSide,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";

import { EngineGameUpdatedMessageEventPayload } from "../../../shared/types";
import { GAME_UPDATED_TOKEN } from "../../../shared/tokens";
import { EngineController } from "./engine.controller";
import { PiecesService } from "../pieces/pieces.service";

@singleton()
export class EngineService {
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule,
		@inject(PiecesService) private readonly _pieceService: PiecesService
	) {}

	public handlePieceSelected(
		payload: ObservablePayload<EngineController["pieceSelected$"]>
	) {
		const { possibleCoords, piece } = payload;

		this._pieceService.resetPieces();

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this.chessboard.board.component.setMarkers(possibleCoords);
	}

	public handlePieceMoved(
		payload: ObservablePayload<EngineController["pieceMoved$"]>
	) {
		const { piece, startCoord, endCoord, nextMoveIndex, nextMove } = payload;
		const flags = nextMove?.flags as MoveFlags;
		const oppositeColor = getOppositeColorSide(piece.color);
		const positionOffset = { x: 0, y: 0.5, z: 0 };

		let pieceToDrop: MatrixPieceModel | undefined = undefined;

		if (!endCoord || !(nextMoveIndex >= 0) || !nextMove)
			return this.chessboard.pieces.component.movePieceByCoord(
				piece,
				startCoord,
				positionOffset
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
			const rookCoord = {
				...endCoord,
				col: flags === MoveFlags.queenside_castle ? 0 : 7
			};
			const rook = this.chessboard.pieces.component.getPieceByCoord(
				PieceType.rook,
				piece.color,
				rookCoord
			);

			if (rook) {
				const newrookCoord = {
					...endCoord,
					col: flags === MoveFlags.queenside_castle ? 3 : 5
				};

				this.chessboard.pieces.component.movePieceByCoord(
					rook,
					newrookCoord,
					positionOffset
				);
			}
		}

		if (pieceToDrop) this.chessboard.pieces.component.dropPiece(pieceToDrop);

		this.chessboard.pieces.component.movePieceByCoord(
			piece,
			endCoord,
			positionOffset
		);

		if (nextMove.promotion && piece.type === PieceType.pawn) {
			this.chessboard.pieces.component.promotePiece(
				piece as MatrixPieceModel<PieceType.pawn, (typeof piece)["color"]>,
				nextMove.promotion as PieceType
			);
		}

		this.game.move(nextMove);

		self.postMessage({
			token: GAME_UPDATED_TOKEN,
			value: {
				fen: this.game.fen(),
				turn: this.game.turn(),
				move: payload.nextMove
			}
		} satisfies EngineGameUpdatedMessageEventPayload);
	}
}
