import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { PiecesComponent } from "../pieces/pieces.component";
import { EngineController } from "./engine.controller";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(PiecesComponent) private readonly pieceComponent: PiecesComponent,
		@inject(EngineController) private readonly controller: EngineController
	) {}

	public init() {
		this.controller.pieceMoved$?.subscribe((payload) => {
			const { piece, cell, intersection, nextMoveIndex, nextMove } = payload;

			if (!intersection || !cell || !(nextMoveIndex >= 0) || !nextMove)
				return this.pieceComponent.movePieceByCoord(piece, piece.coord);

			this.pieceComponent.movePieceByCoord(piece, cell.coord);
			if (payload.nextMove) this.component.game.move(payload.nextMove);
		});

		this.controller.pieceCaptured$?.subscribe(() => {});
	}

	public dispose() {}
}
