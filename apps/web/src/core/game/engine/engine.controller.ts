import { inject, singleton } from "tsyringe";
import { map, Observable, Subject } from "rxjs";
import { Chess, Move } from "chess.js";
import {
	ChessboardModule,
	PieceNotificationPayload
} from "@chess-d/chessboard";
import { coordToSquare, squareToCoord } from "@chess-d/shared";

import {
	EngineNotificationPayload,
	EnginePieceMovedNotificationPayload
} from "../../../shared/types";
import { GameController } from "../game.controller";

@singleton()
export class EngineController {
	public readonly undoMove$$ = new Subject<Move>();
	public readonly redoMove$$ = new Subject<Move>();
	public readonly pieceSelected$?: Observable<EngineNotificationPayload>;
	public readonly pieceMoved$?: Observable<EnginePieceMovedNotificationPayload>;

	constructor(
		@inject(Chess) private readonly _game: Chess,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule
	) {
		this.pieceSelected$ = this._chessboard.pieces
			.getPieceSelected$()
			?.pipe(map((payload) => this._getEnginePayLoadFromPiece(payload)));

		this.pieceMoved$ = this._chessboard.pieces.getPieceDeselected$()?.pipe(
			map((payload) => {
				const { endCoord, possibleCoords, possibleMoves, ...enginePayload } =
					this._getEnginePayLoadFromPiece(payload);

				const nextMoveIndex = possibleCoords.findIndex(
					(coord) =>
						endCoord && coord.col === endCoord.col && coord.row === endCoord.row
				);
				const nextMove = possibleMoves[nextMoveIndex];

				return {
					...payload,
					...enginePayload,
					endCoord,
					possibleCoords,
					possibleMoves,
					nextMoveIndex,
					nextMove
				};
			})
		);
	}

	private _getEnginePayLoadFromPiece<
		PiecePayload extends PieceNotificationPayload
	>(piecePayload: PiecePayload): EngineNotificationPayload & PiecePayload {
		const pgnSquare = coordToSquare(piecePayload.startCoord);
		const possibleMoves = this._game.moves({
			square: pgnSquare,
			verbose: true
		});
		const possibleCoords = possibleMoves.map((moves) =>
			squareToCoord(moves.to)
		);

		return {
			...piecePayload,
			pgnSquare,
			possibleMoves,
			possibleCoords
		};
	}
}
