import { inject, singleton } from "tsyringe";
import { Color } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { WorldComponent } from "./world.component";
import { WorldController } from "./world.controller";

@singleton()
export class WorldModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(WorldComponent) private readonly component: WorldComponent,
		@inject(WorldController) private readonly controller: WorldController
	) {}

	public init() {
		this.component.init(this.appModule.world.scene());

		this.appModule.world
			.scene()
			.add(this.component.ambientLight, this.component.directionalLight);
	}

	public dispose() {}
}
