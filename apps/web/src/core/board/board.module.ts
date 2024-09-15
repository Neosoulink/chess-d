import { inject, singleton } from "tsyringe";

import { AppModule, Module } from "@quick-threejs/reactive";

import { BoardComponent } from "./board.component";
import { BoardController } from "./board.controller";
import { EngineController } from "../engine/engine.controller";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class BoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(BoardComponent)
		private readonly component: BoardComponent,
		@inject(BoardController)
		private readonly controller: BoardController,
		@inject(EngineController)
		private readonly engineController: EngineController,
		@inject(PiecesController)
		private readonly piecesController: PiecesController
	) {
		this.engineController.pieceSelected$?.subscribe((payload) => {
			const { possibleCoords } = payload;

			this.component.setMarkers(possibleCoords);
		});

		this.piecesController.pieceDeselected$?.subscribe(() => {
			this.component.setMarkers([]);
		});
	}

	public init() {
		this.component.initCells();
		this.component.initPhysics();

		this.appModule.world
			.scene()
			.add(this.component.mesh, this.component.markersGroup);
	}

	public dispose() {}
}
