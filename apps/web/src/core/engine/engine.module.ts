import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { EngineController } from "./engine.controller";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(EngineController) private readonly controller: EngineController,
		@inject(PiecesController) private readonly pieceController: PiecesController
	) {}

	public init() {
		this.controller.pieceMoved$?.subscribe((payload) => {
			const { piece, cell, intersection, nextMoveIndex, nextMove } = payload;

			if (!intersection || !cell || !(nextMoveIndex >= 0) || !nextMove) {
				this.pieceController.setPieceCoord(
					piece.type,
					piece.color,
					piece.id,
					piece.coord
				);

				return;
			}

			this.pieceController.setPieceCoord(
				piece.type,
				piece.color,
				piece.id,
				cell.coord
			);

			if (payload.nextMove) this.component.game.move(payload.nextMove);
		});
	}

	public dispose() {}
}
