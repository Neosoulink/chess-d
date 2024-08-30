import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { GameComponent } from "./game.component";
import { GameController } from "./game.controller";

@singleton()
export class GameModule implements Module {
	constructor(
		@inject(GameComponent) private readonly component: GameComponent,
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(GameController) private readonly controller: GameController
	) {}

	public init() {}

	public dispose() {}
}
