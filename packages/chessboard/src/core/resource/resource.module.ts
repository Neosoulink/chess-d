import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ResourceComponent } from "./resource.component";
import { ResourceController } from "./resource.controller";

@singleton()
export class ResourceModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ResourceComponent) private readonly component: ResourceComponent,
		@inject(ResourceController) private readonly controller: ResourceController
	) {}

	public init() {}

	public dispose() {}
}
