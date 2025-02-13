import { Chess, Move, validateFen } from "chess.js";
import { inject, singleton } from "tsyringe";
import { ChessboardModule, MatrixPieceModel } from "@chess-d/chessboard";
import {
	getOppositeColorSide,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";

import { EngineUpdatedMessageData } from "../../../shared/types";
import { GAME_UPDATED_TOKEN } from "../../../shared/tokens";
import { EngineController } from "./engine.controller";
import { PiecesService } from "../pieces/pieces.service";
import { GameController } from "../game.controller";

@singleton()
export class EngineService {
	public readonly undoHistory: Move[] = [];

	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule,
		@inject(PiecesService) private readonly _pieceService: PiecesService
	) {}

	private _postGameState(nextMove?: Move) {
		self.postMessage({
			token: GAME_UPDATED_TOKEN,
			value: {
				fen: this.game.fen(),
				turn: this.game.turn(),
				move: nextMove
			}
		} satisfies EngineUpdatedMessageData);
	}

	public handlePieceSelected(
		payload: ObservablePayload<EngineController["pieceSelected$"]>
	) {
		const { possibleCoords, piece } = payload;

		this._pieceService.resetPieces();

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this.chessboard.board.setMarkers(possibleCoords);
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
			return this.chessboard.pieces.setPieceCoord(
				piece,
				startCoord,
				positionOffset
			);

		if (nextMove.captured)
			pieceToDrop = this.chessboard.pieces.getPieceByCoord(
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
			const rook = this.chessboard.pieces.getPieceByCoord(
				PieceType.rook,
				piece.color,
				rookCoord
			);

			if (rook) {
				const newRookCoord = {
					...endCoord,
					col: flags === MoveFlags.queenside_castle ? 3 : 5
				};

				this.chessboard.pieces.setPieceCoord(
					rook,
					newRookCoord,
					positionOffset
				);
			}
		}

		if (pieceToDrop) this.chessboard.pieces.dropPiece(pieceToDrop);

		this.chessboard.pieces.setPieceCoord(piece, endCoord, positionOffset);

		if (nextMove.promotion && piece.type === PieceType.pawn) {
			this.chessboard.pieces.promotePiece({
				piece: piece as MatrixPieceModel<
					PieceType.pawn,
					(typeof piece)["color"]
				>,
				toPiece: nextMove.promotion as PieceType
			});
		}

		this.game.move(nextMove);
		this._postGameState(payload.nextMove);
	}

	public undoMove(): Move | null {
		const move = this.game.undo();
		if (move) this.undoHistory.push(move);

		this._postGameState();
		return move;
	}

	public redoMove(): Move | null {
		const move = this.undoHistory.pop();
		if (!move) return null;

		this._postGameState();
		return this.game.move(move);
	}

	public reset(data: ObservablePayload<GameController["reset$"]>) {
		const { fen } = data || {};

		if (fen && validateFen(fen).ok) this.game.load(fen);
		else this.game.reset();

		this._postGameState();
	}
}
