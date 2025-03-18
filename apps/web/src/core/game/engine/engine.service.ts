import { Chess, Move, validateFen } from "chess.js";
import { inject, singleton } from "tsyringe";
import { ChessboardModule, MatrixPieceModel } from "@chess-d/chessboard";
import {
	getOppositeColorSide,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";

import { EngineUpdatedMessageData, MoveLike } from "../../../shared/types";
import { GAME_UPDATED_TOKEN } from "../../../shared/tokens";
import { PiecesService } from "../pieces/pieces.service";
import { GameController } from "../game.controller";
import { EngineController } from "./engine.controller";

@singleton()
export class EngineService {
	public redoHistory: MoveLike[] = [];

	constructor(
		@inject(Chess) private readonly _game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule,
		@inject(PiecesService) private readonly _pieceService: PiecesService
	) {}

	private _postState(nextMove?: Move) {
		self.postMessage({
			token: GAME_UPDATED_TOKEN,
			value: {
				move: nextMove,
				redoHistory: this.redoHistory,
				history: this._game.history({ verbose: true }),

				ascii: this._game.ascii(),
				fen: this._game.fen(),
				inCheck: this._game.inCheck(),
				isCheck: this._game.isCheck(),
				isCheckmate: this._game.isCheckmate(),
				isDraw: this._game.isDraw(),
				isGameOver: this._game.isGameOver(),
				isInsufficientMaterial: this._game.isInsufficientMaterial(),
				isStalemate: this._game.isStalemate(),
				isThreefoldRepetition: this._game.isThreefoldRepetition(),
				pgn: this._game.pgn(),
				turn: this._game.turn()
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

		if (nextMove.promotion && piece.type === PieceType.pawn)
			this.chessboard.pieces.promotePiece({
				piece: piece as MatrixPieceModel<
					PieceType.pawn,
					(typeof piece)["color"]
				>,
				toPiece: nextMove.promotion as PieceType
			});

		this._game.move(nextMove);
		this.redoHistory = [];
		this._postState(payload.nextMove);
	}

	public handleUndo(): Move | null {
		const move = this._game.undo();
		if (move)
			this.redoHistory.push({
				from: move.from,
				to: move.to,
				san: move.san,
				promotion: move.promotion
			});

		this._postState();
		return move;
	}

	public handleRedo(): MoveLike | null {
		const move = this.redoHistory.pop();
		if (!move) return null;

		this._game.move(move);
		this._postState();

		return move;
	}

	public reset(data: ObservablePayload<GameController["reset$"]>) {
		const { fen, pgn, redoHistory } = data || {};

		this._game.reset();
		this.redoHistory = [];

		if (fen && validateFen(fen).ok) this._game.load(fen);
		if (pgn) this._game.loadPgn(pgn);
		if (Array.isArray(redoHistory)) this.redoHistory = redoHistory;

		this._postState();
	}
}
