import {
	ChessboardModule,
	PieceNotificationPayload
} from "@chess-d/chessboard";
import { coordToSquare, squareToCoord } from "@chess-d/shared";
import { Chess } from "chess.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { filter, fromEvent, map, merge, Observable, Subject } from "rxjs";

import {
	EngineNotificationPayload,
	EnginePieceMovedNotificationPayload,
	MessageData
} from "../../../shared/types";
import {
	ENGINE_WILL_REDO_TOKEN,
	ENGINE_WILL_UNDO_TOKEN
} from "../../../shared/tokens/engine.token";

@scoped(Lifecycle.ContainerScoped)
export class EngineController {
	public readonly undo$$ = new Subject();
	public readonly redo$$ = new Subject();

	public readonly pieceSelected$?: Observable<EngineNotificationPayload>;
	public readonly pieceMoved$?: Observable<EnginePieceMovedNotificationPayload>;
	public readonly undo$: Observable<unknown>;
	public readonly redo$: Observable<unknown>;

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

		this.undo$ = merge(
			this.undo$$,
			fromEvent(self, "message").pipe(
				filter<any>(
					(e: MessageEvent<MessageData>) =>
						e.data.token === ENGINE_WILL_UNDO_TOKEN
				),
				map((e: MessageEvent<MessageData>) => e.data.value)
			)
		);

		this.redo$ = merge(
			this.redo$$,
			fromEvent(self, "message").pipe(
				filter<any>(
					(e: MessageEvent<MessageData>) =>
						e.data.token === ENGINE_WILL_REDO_TOKEN
				),
				map((e: MessageEvent<MessageData>) => e.data.value)
			)
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
