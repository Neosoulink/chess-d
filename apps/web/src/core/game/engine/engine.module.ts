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
	) {}

	public init() {
		this.subscriptions.push(
			this._controller.pieceSelected$?.subscribe(
				this._service.handlePieceSelected.bind(this._service)
			),
			this._controller.pieceMoved$?.subscribe(
				this._service.handlePieceMoved.bind(this._service)
			),
			this._gameController.reset$.subscribe(
				this._service.reset.bind(this._service)
			)
		);
	}

	public getUndoHistory() {
		return this._service.undoHistory;
	}

	public getUndoMove$() {
		return this._controller.undoMove$$.asObservable();
	}

	public getRedoMove$() {
		return this._controller.redoMove$$.asObservable();
	}

	public undoMove() {
		const move = this._service.undoMove();
		console.log("undoMove", move);
		if (move) this._controller.undoMove$$.next(move);
	}

	public redoMove() {
		const move = this._service.redoMove();
		if (move) this._controller.redoMove$$.next(move);
	}

	public dispose() {
		this.subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.subscriptions = [];
	}
}
