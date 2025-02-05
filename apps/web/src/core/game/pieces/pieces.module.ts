import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";
import { EngineController } from "../engine/engine.controller";
import { GameController } from "../game.controller";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesService) private readonly _service: PiecesService,
		@inject(PiecesController) private readonly _controller: PiecesController,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(EngineController)
		private readonly _engineController: EngineController
	) {}

	public init(): void {
		this._subscriptions.push(
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._engineController.undoMove$$?.subscribe((move) =>
				this._service.reset(move.before)
			),
			this._gameController.reset$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._engineController.redoMove$$?.subscribe((move) =>
				this._service.reset(move.after)
			)
		);
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
