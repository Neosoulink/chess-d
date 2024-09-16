import { inject, singleton } from "tsyringe";
import { map, Observable, Subject } from "rxjs";
import { AppModule } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { PiecesController } from "../pieces/pieces.controller";
import {
	coordToEngineSquare,
	EnginePieceUpdatePayload,
	engineSquareToCoord,
	PieceUpdatePayload
} from "../../shared";

@singleton()
export class EngineController {
	public readonly started$$ = new Subject<any>();
	public readonly pieceSelected$?: Observable<EnginePieceUpdatePayload>;
	public readonly pieceDeselected$?: EngineController["pieceSelected$"];

	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(PiecesController)
		private readonly pieceController: PiecesController,
		@inject(AppModule) private readonly appModule: AppModule
	) {
		this.pieceSelected$ = this.pieceController.pieceSelected$?.pipe(
			map((payload) => this._getEnginePayLoadFromPiece(payload))
		);

		this.pieceDeselected$ = this.pieceController.pieceDeselected$?.pipe(
			map((payload) => this._getEnginePayLoadFromPiece(payload))
		);
	}

	private _getEnginePayLoadFromPiece(
		piecePayload: PieceUpdatePayload
	): EnginePieceUpdatePayload {
		const pgnSquare = coordToEngineSquare(
			piecePayload.piece.coord
		) as EnginePieceUpdatePayload["pgnSquare"];
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
