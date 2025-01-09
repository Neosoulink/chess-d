import { AppModule, Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { HandService } from "./hands.service";
import { HandController } from "./hands.controller";
import { Chess } from "chess.js";
import { ColorSide, getOppositeColorSide } from "@chess-d/shared";

@singleton()
export class HandModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(Chess) private readonly _chess: Chess,
		@inject(HandService) private readonly _service: HandService,
		@inject(HandController) private readonly _controller: HandController
	) {
		this._subscriptions.push(
			this._app.timer.step$().subscribe(({ deltaTime }) => {
				this._service.update(deltaTime);
			}),
			this._controller.pieceSelected$?.subscribe(
				this._service.handlePieceSelected.bind(this._service)
			),
			this._controller.pieceMoving$?.subscribe(
				this._service.handlePieceMoving.bind(this._service)
			),
			this._controller.pieceDeselected$?.subscribe(
				this._service.handlePieceDeselected.bind(this._service)
			)
		);
	}

	init(): void {
		this._service.init();
	}

	dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
	}
}
