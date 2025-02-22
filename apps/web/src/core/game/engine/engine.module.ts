import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { EngineService } from "./engine.service";
import { EngineController } from "./engine.controller";
import { GameController } from "../game.controller";

@singleton()
export class EngineModule implements Module {
	private subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(EngineController) private readonly _controller: EngineController,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(EngineService) private readonly _service: EngineService
	) {
		this.subscriptions.push(
			this._controller.pieceSelected$?.subscribe(
				this._service.handlePieceSelected.bind(this._service)
			),
			this._controller.pieceMoved$?.subscribe(
				this._service.handlePieceMoved.bind(this._service)
			),
			this._controller.undo$.subscribe(
				this._service.handleUndo.bind(this._service)
			),
			this._controller.redo$.subscribe(
				this._service.handleRedo.bind(this._service)
			),
			this._gameController.reset$.subscribe(
				this._service.reset.bind(this._service)
			)
		);
	}

	public init() {}

	public getRedoHistory() {
		return this._service.redoHistory;
	}

	public dispose() {
		this.subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.subscriptions = [];
	}
}
