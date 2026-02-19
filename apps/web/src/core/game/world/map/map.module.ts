import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { MapService } from "./map.service";
import { MapController } from "./map.controller";

@singleton()
export class MapModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(MapService) private readonly _service: MapService,
		@inject(MapController) private readonly _controller: MapController
	) {
		this._subscriptions.push(
			this._controller.reset$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._controller.introAnimation$.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			)
		);
	}

	public init(): void {}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
