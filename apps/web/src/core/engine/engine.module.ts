import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { EngineController } from "./engine.controller";
import { InstancedSquare } from "../../shared";
import { BoardComponent } from "../board/board.component";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(BoardComponent) private readonly boardComponent: BoardComponent,
		@inject(EngineController) private readonly controller: EngineController,
		@inject(PiecesController) private readonly pieceController: PiecesController
	) {}

	public init() {
		this.controller.pieceDeselected$?.subscribe((payload) => {
			const { intersection, piece } = payload;

			if (typeof intersection?.instanceId !== "number") return;

			const instancedSquare = intersection.object as InstancedSquare;
			const square = instancedSquare.getSquareByIndex(intersection.instanceId);

			if (!square) return;

			this.pieceController.setPieceCoord(
				piece.type,
				piece.color,
				piece.id,
				square.coord
			);
		});
	}

	public dispose() {}
}
