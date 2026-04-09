import { Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@scoped(Lifecycle.ContainerScoped)
export class SettingsModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(SettingsController)
		private readonly _controller: SettingsController,
		@inject(SettingsService) private readonly _service: SettingsService
	) {
		this._subscriptions.push(
			this._controller.update$.subscribe(
				this._service.handleUpdate.bind(this._service)
			)
		);
	}

	init(): void {}

	dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
	}
}
