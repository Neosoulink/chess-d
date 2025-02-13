import { AppModule, Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { GameController } from "../game.controller";
import { WorldService } from "./world.service";
import { WorldController } from "./world.controller";
import { ChessboardModule } from "@chess-d/chessboard";

@singleton()
export class WorldModule implements Module {
	private readonly _subscriptions: Subscription[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(WorldController) private readonly _controller: WorldController,
		@inject(WorldService) private readonly _service: WorldService
	) {
		this._subscriptions.push(
			this._app.timer
				.step$()
				.subscribe(this._service.update.bind(this._service)),
			this._controller.introAnimation$.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			),
			this._controller.dayCycle$.subscribe(
				this._service.handleDayCycle.bind(this._service)
			),
			this._controller.idleAnimation$.subscribe(
				this._service.handleIdleAnimation.bind(this._service)
			),
			this._gameController.reset$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._chessboard.pieces.getPieceDropped$$().subscribe(() => {
				this._service.resetChessboard();
			})
		);
	}

	init(): void {
		this._app.world.scene().add(this._service.scene);
	}

	dispose(): void {
		this._service.scene.clear();
		this._subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
