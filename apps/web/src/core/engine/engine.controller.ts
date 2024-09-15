import { inject, singleton } from "tsyringe";
import { map, Observable } from "rxjs";

import { EngineComponent } from "./engine.component";
import { PiecesController } from "../pieces/pieces.controller";
import {
	coordToEngineSquare,
	EnginePieceUpdatePayload,
	engineSquareToCoord
} from "../../shared";

@singleton()
export class EngineController {
	public readonly pieceSelected$?: Observable<EnginePieceUpdatePayload>;

	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(PiecesController) private readonly pieceController: PiecesController
	) {
		this.pieceSelected$ = this.pieceController.pieceSelected$?.pipe(
			map((payload) => {
				const pgnSquare = coordToEngineSquare(
					payload.piece.coords
				) as EnginePieceUpdatePayload["pgnSquare"];
				const possibleMoves = this.component.game.moves({
					square: pgnSquare,
					verbose: true
				});
				const possibleCoords = possibleMoves.map((moves) =>
					engineSquareToCoord(moves.to)
				);

				return {
					...payload,
					pgnSquare,
					possibleMoves,
					possibleCoords
				};
			})
		);
	}
}
