import { Module } from "@quick-threejs/reactive";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Subscription } from "rxjs";

import { CameraService } from "./camera.service";
import { CameraController } from "./camera.controller";

@scoped(Lifecycle.ContainerScoped)
export class CameraModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(CameraController) private readonly _controller: CameraController,
		@inject(CameraService) private readonly _service: CameraService
	) {
		this._subscriptions.push(
			this._controller.settingsUpdate$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._controller.introAnimation$.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			),
			this._controller.idleAnimation$.subscribe(
				this._service.handleIdleAnimation.bind(this._service)
			),
			this._controller.reset$.subscribe(this._service.reset.bind(this._service))
		);
	}

	init(): void {}

	dispose(): void {
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
