import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { WorldComponent } from "./world.component";

@singleton()
export class WorldModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(WorldComponent) private readonly component: WorldComponent
	) {}

	public init() {
		this.component.init(this.appModule.world.scene());
	}

	public dispose() {}
}
