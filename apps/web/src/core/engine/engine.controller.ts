import { inject, singleton } from "tsyringe";
import { filter, map, Observable, Subject } from "rxjs";
import { AppModule } from "@quick-threejs/reactive";
import { Move } from "chess.js";

import { EngineComponent } from "./engine.component";
import { PiecesController } from "../pieces/pieces.controller";
import {
	coordToEngineSquare,
	EngineNotificationPayload,
	engineSquareToCoord,
	ObservablePayload,
	PieceNotificationPayload
} from "../../shared";

@singleton()
export class EngineController {
	public readonly started$$ = new Subject<any>();
	public readonly pieceSelected$?: Observable<EngineNotificationPayload>;
	public readonly pieceMoved$?: Observable<
		EngineNotificationPayload & {
			nextMoveIndex: number;
			nextMove?: Move;
		} & ObservablePayload<PiecesController["pieceDeselected$"]>
	>;
	public readonly pieceCaptured$?: EngineController["pieceMoved$"];

	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(PiecesController)
		private readonly pieceController: PiecesController,
		@inject(AppModule) private readonly appModule: AppModule
	) {
		this.pieceSelected$ = this.pieceController.pieceSelected$?.pipe(
			map((payload) => this._getEnginePayLoadFromPiece(payload))
		);

		this.pieceMoved$ = this.pieceController.pieceDeselected$?.pipe(
			map((payload) => {
				const { cell, possibleCoords, possibleMoves, ...enginePayload } =
					this._getEnginePayLoadFromPiece(payload);

				const nextMoveIndex = possibleCoords.findIndex(
					(coord) =>
						cell && coord.col === cell.coord.col && coord.row === cell.coord.row
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

		this.pieceCaptured$ = this.pieceMoved$?.pipe(
			filter((payload) => !!payload?.nextMove?.captured)
		);
	}

	private _getEnginePayLoadFromPiece<
		PiecePayload extends PieceNotificationPayload
	>(piecePayload: PiecePayload): EngineNotificationPayload & PiecePayload {
		const pgnSquare = coordToEngineSquare(piecePayload.piece.coord);
		const possibleMoves = this.component.game.moves({
			square: pgnSquare,
			verbose: true
		});
		const possibleCoords = possibleMoves.map((moves) =>
			engineSquareToCoord(moves.to)
		);

		return {
			...piecePayload,
			pgnSquare,
			possibleMoves,
			possibleCoords
		};
	}
}
