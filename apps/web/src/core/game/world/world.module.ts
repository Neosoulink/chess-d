import { AppModule, Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";

import { WorldService } from "./world.service";
import { Subscription } from "rxjs";

@singleton()
export class WorldModule implements Module {
	private readonly _subscriptions: Subscription[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _service: WorldService
	) {}

	init(): void {
		this._service.reset();
		this._app.world.scene().add(this._service.scene);
		this._subscriptions.push(
			this._app.timer
				.step$()
				.subscribe(({ elapsedTime }) =>
					this._service.handleAnimation(elapsedTime)
				)
		);
	}

	dispose(): void {
		this._service.scene.clear();
		this._subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
