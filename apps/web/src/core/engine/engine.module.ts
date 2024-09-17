import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { EngineController } from "./engine.controller";
import { EnginePieceUpdatePayload, InstancedSquare } from "../../shared";
import { PiecesController } from "../pieces/pieces.controller";
import { copyProperties } from "@quick-threejs/utils";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(EngineController) private readonly controller: EngineController,
		@inject(PiecesController) private readonly pieceController: PiecesController
	) {}

	public init() {
		this.controller.pieceDeselected$?.subscribe(
			this._pieceDeselectedNotification.bind(this)
		);
	}

	private _pieceDeselectedNotification(payload: EnginePieceUpdatePayload) {
		const { intersection, piece, possibleCoords, possibleMoves } = payload;

		const instancedCell = intersection?.object as InstancedSquare;
		const cell =
			typeof intersection?.instanceId === "number" &&
			instancedCell.getCellByIndex(intersection.instanceId);
		const nextMoveIndex = possibleCoords.findIndex(
			(coord) =>
				cell && coord.col === cell.coord.col && coord.row === cell.coord.row
		);
		const nextMove = possibleMoves[nextMoveIndex];

		if (!intersection || !cell || !(nextMoveIndex >= 0) || !nextMove) {
			piece.setPosition({
				...copyProperties(piece.userData.initialPosition, ["x", "z"]),
				y: 0.8
			});

			return;
		}

		this.pieceController.setPieceCoord(
			piece.type,
			piece.color,
			piece.id,
			cell.coord
		);

		this.component.game.move(nextMove);
	}

	public dispose() {}
}
