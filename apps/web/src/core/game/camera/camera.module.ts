import { Module } from "@quick-threejs/reactive";
import { AppModule } from "@quick-threejs/reactive/worker";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Subscription } from "rxjs";

import { GameController } from "../game.controller";
import { CameraService } from "./camera.service";
import { CameraController } from "./camera.controller";

@scoped(Lifecycle.ContainerScoped)
export class CameraModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(CameraController) private readonly _controller: CameraController,
		@inject(CameraService) private readonly _service: CameraService
	) {
		this._subscriptions.push(
			this._app.timer
				.step$()
				.subscribe(this._service.update.bind(this._service)),
			this._controller.introAnimation$.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			),
			this._controller.idleAnimation$.subscribe(
				this._service.handleIdleAnimation.bind(this._service)
			),
			this._gameController.reset$.subscribe(
				this._service.reset.bind(this._service)
			)
		);
	}

	init(): void {
		this._service.init();
	}

	dispose(): void {
		this._service.dispose();
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
	}
}
