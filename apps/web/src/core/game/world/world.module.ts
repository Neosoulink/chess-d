import { AppModule, Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";

import { WorldService } from "./world.service";
import { Subscription } from "rxjs";
import { WorldController } from "./world.controller";

@singleton()
export class WorldModule implements Module {
	private readonly _subscriptions: Subscription[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _service: WorldService,
		@inject(WorldController) private readonly _controller: WorldController
	) {}

	init(): void {
		this._service.reset();
		this._app.world.scene().add(this._service.scene);
		this._subscriptions.push(
			this._app.timer
				.step$()
				.subscribe(this._service.handleUpdates.bind(this._service)),
			this._controller.dayNightCycle$.subscribe(
				this._service.handleDayCycle.bind(this._service)
			)
		);
	}

	dispose(): void {
		this._service.scene.clear();
		this._subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
