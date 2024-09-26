import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { EngineController } from "./engine.controller";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(EngineController) private readonly controller: EngineController
	) {
		this.controller.pieceMoved$?.subscribe((payload) => {
			if (payload.nextMove) this.component.game.move(payload.nextMove);
		});
	}

	public init() {}

	public dispose() {}
}
