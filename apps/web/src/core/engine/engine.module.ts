import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { PiecesComponent } from "../pieces/pieces.component";
import { EngineController } from "./engine.controller";
import {
	getOppositeColor,
	MatrixPieceModel,
	MoveFlags,
	ObservablePayload,
	PieceType
} from "../../shared";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(PiecesComponent) private readonly pieceComponent: PiecesComponent,
		@inject(EngineController) private readonly controller: EngineController
	) {}

	private _pieceMovedHandler(
		payload: ObservablePayload<EngineController["pieceMoved$"]>
	) {
		const { piece, cell, intersection, nextMoveIndex, nextMove } = payload;
		const flags = nextMove?.flags as MoveFlags;
		const oppositeColor = getOppositeColor(piece.color);

		let pieceToDrop: MatrixPieceModel | undefined = undefined;

		if (!intersection || !cell || !(nextMoveIndex >= 0) || !nextMove)
			return this.pieceComponent.movePieceByCoord(piece, piece.coord);

		if (nextMove.captured)
			pieceToDrop = this.pieceComponent.getPieceByCoord(
				nextMove.captured as PieceType,
				oppositeColor,
				nextMove.flags === "e"
					? {
							...cell.coord,
							row: cell.coord.row + (nextMove.color === "w" ? -1 : 1)
						}
					: cell.coord
			);

		if (
			flags === MoveFlags.kingside_castle ||
			flags === MoveFlags.queenside_castle
		) {
			const rockCoord = {
				...cell.coord,
				col: flags === MoveFlags.queenside_castle ? 0 : 7
			};
			const rock = this.pieceComponent.getPieceByCoord(
				PieceType.rock,
				piece.color,
				rockCoord
			);

			if (rock) {
				const newRockCoord = {
					...cell.coord,
					col: flags === MoveFlags.queenside_castle ? 3 : 5
				};

				this.pieceComponent.movePieceByCoord(rock, newRockCoord);
			}
		}

		// if (nextMove.promotion) {
		// 	const
		// }

		if (pieceToDrop) {
			this.pieceComponent.dropPiece(pieceToDrop);
		}

		this.pieceComponent.movePieceByCoord(piece, cell.coord);
		this.component.game.move(nextMove);
	}

	public init() {
		this.controller.pieceMoved$?.subscribe(this._pieceMovedHandler.bind(this));
	}

	public dispose() {}
}
