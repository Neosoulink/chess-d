import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { PiecesComponent } from "../pieces/pieces.component";
import { EngineController } from "./engine.controller";
import { getOppositeColor, PieceType } from "../../shared";

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

			if (nextMove.captured) {
				const pieceToDelete = this.pieceComponent.getPieceByCoord(
					nextMove.captured as PieceType,
					getOppositeColor(piece.color),
					nextMove.flags === "e"
						? {
								...cell.coord,
								row: cell.coord.row + (nextMove.color === "w" ? -1 : 1)
							}
						: cell.coord
				);

				if (pieceToDelete) this.pieceComponent.dropPiece(pieceToDelete);
			}

			if (payload.nextMove) this.component.game.move(payload.nextMove);

			this.pieceComponent.movePieceByCoord(piece, cell.coord);
		});
	}

	public dispose() {}
}
