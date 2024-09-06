import { inject, singleton } from "tsyringe";

import { AppModule, Module } from "@quick-threejs/reactive";

import { BoardComponent } from "./board.component";
import { BoardController } from "./board.controller";

@singleton()
export class BoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(BoardComponent)
		private readonly component: BoardComponent,
		private readonly controller: BoardController
	) {}

	public init() {
		this.component.initCells();
		this.component.initPhysics();
		this.component.setMarkers([
			{ col: 1, row: 1 },
			{ col: 2, row: 2 },
			{ col: 4, row: 7 }
		]);

		this.appModule.world
			.scene()
			.add(this.component.mesh, this.component.markersGroup);
	}

	public dispose() {}
}
