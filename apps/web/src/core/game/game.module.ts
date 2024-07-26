import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { GameComponent } from "./game.component";
import { GameController } from "./game.controller";

@singleton()
export class GameModule implements Module {
	constructor(
		@inject(GameComponent) private readonly component: GameComponent,
		@inject(GameController) private readonly controller: GameController
	) {}

	public init(app: AppModule) {
		this.component.scene = app.world.scene();
	}

	public dispose() {}
}
