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

		this.appModule.world.scene().add(this.component.mesh);
	}

	public dispose() {}
}
