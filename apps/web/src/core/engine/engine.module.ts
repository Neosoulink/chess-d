import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { EngineComponent } from "./engine.component";
import { EngineController } from "./engine.controller";

@singleton()
export class EngineModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(EngineComponent) private readonly component: EngineComponent,
		@inject(EngineController) private readonly controller: EngineController
	) {}

	public init() {}

	public dispose() {}
}
