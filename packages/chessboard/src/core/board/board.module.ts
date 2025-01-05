import { AppModule, Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";

import { BoardComponent } from "./board.component";
import { PiecesController } from "../pieces/pieces.controller";

@singleton()
export class BoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(BoardComponent)
		public readonly component: BoardComponent,
		@inject(PiecesController)
		private readonly piecesController: PiecesController
	) {
		this.piecesController.pieceDeselected$?.subscribe(() => {
			this.component.setMarkers([]);
		});
	}

	public init() {
		this.component.initCells();
		this.component.initPhysics();

		this.appModule.world
			.scene()
			.add(this.component.instancedCell, this.component.markersGroup);
	}

	public dispose() {}
}
