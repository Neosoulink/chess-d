import { inject, singleton } from "tsyringe";
import { map, Observable } from "rxjs";
import { Chess } from "chess.js";
import {
	CoreModule as ChessboardModule,
	PieceNotificationPayload
} from "@chess-d/chessboard";
import { coordToSquare, squareToCoord } from "@chess-d/shared";

import {
	EngineNotificationPayload,
	EnginePieceMovedNotificationPayload
} from "../../../shared/types";

@singleton()
export class EngineController {
	public readonly pieceSelected$?: Observable<EngineNotificationPayload>;
	public readonly pieceMoved$?: Observable<EnginePieceMovedNotificationPayload>;

	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule
	) {
		this.pieceSelected$ =
			this.chessboard.pieces.controller.pieceSelected$?.pipe(
				map((payload) => this._getEnginePayLoadFromPiece(payload))
			);

		this.pieceMoved$ = this.chessboard.pieces.controller.pieceDeselected$?.pipe(
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
		const possibleMoves = this.game.moves({
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
