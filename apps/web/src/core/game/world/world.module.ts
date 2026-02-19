import { Module } from "@quick-threejs/reactive";
import { AppModule } from "@quick-threejs/reactive/worker";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Subscription } from "rxjs";

import { WorldController } from "./world.controller";
import { WorldService } from "./world.service";
import { ChessboardModule } from "./chessboard/chessboard.module";
import { HandsModule } from "./hands/hands.module";
import { MapModule } from "./map/map.module";

@scoped(Lifecycle.ContainerScoped)
export class WorldModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(WorldController) private readonly _controller: WorldController,
		@inject(WorldService) private readonly _service: WorldService,
		@inject(AppModule) private readonly _app: AppModule,
		@inject(HandsModule) private readonly _hands: HandsModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(MapModule) private readonly _map: MapModule
	) {
		this._subscriptions.push(
			this._controller.reset$.subscribe(() => {
				this._service.reset.bind(this._service)();
				this._controller.resetDone$$.next();
			}),
			this._controller.step$.subscribe(
				this._service.update.bind(this._service)
			),
			this._controller.introAnimation$.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			)
		);
	}

	init(): void {
		this._service.init();
		this._hands.init();
		this._chessboard.init();
		this._map.init();
	}

	dispose(): void {
		this._service.dispose();
		this._hands.dispose();
		this._chessboard.dispose();
		this._map.dispose();

		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
