import { ChessboardModule, MatrixPieceModel } from "@chess-d/chessboard";
import {
	ColorSide,
	getOppositeColorSide,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";
import { Chess, validateFen } from "chess.js";
import { Color } from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import {
	EnginePieceMovedNotificationPayload,
	EngineUpdatedMessageData,
	GameResetState,
	MessageData,
	MoveLike
} from "@/shared/types";
import {
	OPPONENT_CAPTURE_COLOR,
	OPPONENT_MOVE_COLOR,
	PLAYER_CAPTURE_COLOR,
	PLAYER_MOVE_COLOR
} from "@/shared/constants";
import {
	ENGINE_PIECE_SELECTED_TOKEN,
	GAME_UPDATED_TOKEN
} from "@/shared/tokens";
import { PiecesService } from "../world/chessboard/pieces/pieces.service";
import { ChessboardService } from "../world/chessboard/chessboard.service";
import { EngineController } from "./engine.controller";

@scoped(Lifecycle.ContainerScoped)
export class EngineService {
	public readonly state = {
		playerSide: ColorSide.white,
		startSide: ColorSide.white
	};
	/** @todo Move this to the {@link EngineService["state"]} property. */
	public redoHistory: MoveLike[] = [];

	constructor(
		@inject(Chess) private readonly _game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule,
		@inject(ChessboardService)
		private readonly chessboardService: ChessboardService,
		@inject(PiecesService) private readonly _pieceService: PiecesService
	) {}

	private _postState(payload?: EnginePieceMovedNotificationPayload) {
		const { nextMove, pgnSquare } = payload || {};

		self.postMessage({
			token: GAME_UPDATED_TOKEN,
			value: {
				ascii: this._game.ascii(),
				attackers: pgnSquare ? this._game.attackers(pgnSquare) : [],
				board: this._game.board(),
				fen: this._game.fen(),
				hash: this._game.hash(),
				header: this._game.getHeaders(),
				history: this._game.history({ verbose: true }),
				inCheck: this._game.inCheck(),
				isAttacked:
					!!pgnSquare && this._game.isAttacked(pgnSquare, this._game.turn()),
				isCheck: this._game.isCheck(),
				isCheckmate: this._game.isCheckmate(),
				isDraw: this._game.isDraw(),
				isDrawByFiftyMoves: this._game.isDrawByFiftyMoves(),
				isGameOver: this._game.isGameOver(),
				isInsufficientMaterial: this._game.isInsufficientMaterial(),
				isStalemate: this._game.isStalemate(),
				isThreefoldRepetition: this._game.isThreefoldRepetition(),
				move: nextMove,
				moveNumber: this._game.moveNumber(),
				moves: this._game.moves({ verbose: true }),
				perft: this._game.perft(1),
				pgn: this._game.pgn(),
				playerSide: this.state.playerSide,
				redoHistory: this.redoHistory,
				startSide: this.state.startSide,
				turn: this._game.turn()
			}
		} satisfies EngineUpdatedMessageData);
	}

	public handlePieceSelected(
		payload: ObservablePayload<EngineController["pieceSelected$"]>
	) {
		const { possibleCoords, piece } = payload;
		const isPlayerMove = this.state.playerSide === piece.color;

		// TODO: The engine should not directly reset the pieces' positions! It should receive a signal from the pieces layer!
		this._pieceService.resetPositions();

		piece.physics?.rigidBody.setBodyType(0, true);
		piece.physics?.collider.setMass(1);

		this.chessboardService.setNextMovesMarker(possibleCoords);
		this.chessboardService.nextMovesMarker.setAccentColor(
			new Color(isPlayerMove ? PLAYER_MOVE_COLOR : OPPONENT_MOVE_COLOR)
		);

		self.postMessage({
			token: ENGINE_PIECE_SELECTED_TOKEN
		} satisfies MessageData<void>);
	}

	// TODO: Move checks logic to the controller
	public handlePieceMoved(
		payload: ObservablePayload<EngineController["pieceMoved$"]>
	) {
		const { piece, startCoord, endCoord, nextMoveIndex, nextMove } = payload;
		const isPlayerMove = this.state.playerSide === piece.color;
		const oppositeColor = getOppositeColorSide(piece.color);
		const oppositeKingCoord =
			this.chessboard.pieces.getGroups()[oppositeColor][PieceType.king]
				?.pieces[0]?.coord;
		const flags = nextMove?.flags as MoveFlags;
		const positionOffset = { x: 0, y: 0.5, z: 0 };

		let pieceToDrop: MatrixPieceModel | undefined = undefined;

		if (!endCoord || !(nextMoveIndex >= 0) || !nextMove)
			return this.chessboard.pieces.setPieceCoord(
				piece,
				startCoord,
				positionOffset
			);

		if (nextMove.captured) {
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
		}

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
		this._postState(payload);

		// TODO: This should be handled by the chessboard service.
		this.chessboardService.setPreviousMovesMarker([
			{ col: startCoord.col, row: startCoord.row },
			{ col: endCoord.col, row: endCoord.row }
		]);
		this.chessboardService.setNextMovesMarker([]);
		this.chessboardService.setInDangerMarker([]);
		this.chessboardService.setHintMarker([]);
		this.chessboardService.previousMovesMarker.setAccentColor(
			new Color(
				this.state.playerSide === piece.color
					? PLAYER_MOVE_COLOR
					: OPPONENT_MOVE_COLOR
			)
		);

		if (nextMove?.captured)
			this.chessboardService.previousMovesMarker.setColorAt(
				1,
				new Color(isPlayerMove ? PLAYER_CAPTURE_COLOR : OPPONENT_CAPTURE_COLOR)
			);

		if ((this._game.inCheck() || this._game.isCheck()) && oppositeKingCoord) {
			this.chessboardService.setInDangerMarker([oppositeKingCoord]);
			this.chessboardService.inDangerMarker.setAccentColor(
				new Color(isPlayerMove ? PLAYER_CAPTURE_COLOR : OPPONENT_CAPTURE_COLOR)
			);
		}
	}

	public handleUndo() {
		const move = this._game.undo();
		if (move)
			this.redoHistory.push({
				from: move.from,
				to: move.to,
				san: move.san,
				promotion: move.promotion
			});

		this._postState();
	}

	public handleRedo() {
		const move = this.redoHistory.pop();
		if (!move) return;

		this._game.move(move);
		this._postState();
	}

	public handleGoToMove(
		payload: ObservablePayload<EngineController["goToMove$"]>
	) {
		const { move } = payload;

		const allMoves: MoveLike[] = [
			...this._game.history({ verbose: true }),
			...this.redoHistory.slice().reverse()
		];
		const targetIndex = allMoves.findIndex(
			(m) => m.san === move.san && m.from === move.from && m.to === move.to
		);

		if (targetIndex === -1) return;

		this._game.reset();
		for (const m of allMoves.slice(0, targetIndex + 1)) this._game.move(m);

		this.redoHistory = allMoves.slice(targetIndex + 1).reverse();
		this._postState();
	}

	public reset(data: GameResetState) {
		const { fen, pgn, redoHistory, playerSide, startSide } = data || {};

		this._game.reset();
		this.redoHistory = [];
		this.state.playerSide = playerSide || ColorSide.white;
		this.state.startSide = startSide || ColorSide.white;

		if (fen && validateFen(fen).ok) this._game.load(fen);
		if (pgn) this._game.loadPgn(pgn);
		if (Array.isArray(redoHistory)) this.redoHistory = redoHistory;

		this._postState();
	}
}
