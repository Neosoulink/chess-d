import { inject, singleton } from "tsyringe";
import { Color } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { WorldComponent } from "./world.component";
import { WorldController } from "./world.controller";

@singleton()
export class WorldModule implements Module {
	constructor(
		@inject(WorldComponent) private readonly component: WorldComponent,
		@inject(WorldController) private readonly controller: WorldController
	) {}

	public init(app: AppModule) {
		this.component.init(app.world.scene());

		this.component.scene.background = new Color("#211d20");
		this.component.directionalLight.position.set(0, 0, 1);

		app.world
			.scene()
			.add(this.component.ambientLight, this.component.directionalLight);
	}

	public dispose() {}
}
