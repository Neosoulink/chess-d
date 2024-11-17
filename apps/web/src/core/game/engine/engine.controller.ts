import { inject, singleton } from "tsyringe";
import { map, Observable, Subject } from "rxjs";
import { Chess, Move } from "chess.js";
import { CoreModule as ChessboardModule } from "@chess-d/chessboard";

import {
	coordToSquare,
	EngineNotificationPayload,
	squareToCoord,
	ObservablePayload,
	PieceNotificationPayload
} from "@chess-d/chessboard";

@singleton()
export class EngineController {
	public readonly pieceSelected$?: Observable<EngineNotificationPayload>;
	public readonly pieceMoved$?: Observable<
		EngineNotificationPayload & {
			nextMoveIndex: number;
			nextMove?: Move;
		} & ObservablePayload<
				ChessboardModule["pieces"]["controller"]["pieceMoved$$"]
			>
	>;

	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(ChessboardModule) private readonly chessboard: ChessboardModule
	) {
		this.pieceSelected$ =
			this.chessboard.pieces.controller.pieceSelected$?.pipe(
				map((payload) => this._getEnginePayLoadFromPiece(payload))
			);

		this.pieceMoved$ = this.chessboard.pieces.controller.pieceMoved$$?.pipe(
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
