import { inject, singleton } from "tsyringe";

import { AppModule, Module } from "@quick-threejs/reactive";

import { ChessBoardComponent } from "./chess-board.component";
import { ChessBoardController } from "./chess-board.controller";

@singleton()
export class ChessBoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ChessBoardComponent)
		private readonly component: ChessBoardComponent,
		private readonly controller: ChessBoardController
	) {}

	public init() {
		this.component.initCells();
		this.component.initPhysics();

		this.appModule.world.scene().add(this.component.board);
	}

	public dispose() {}
}
