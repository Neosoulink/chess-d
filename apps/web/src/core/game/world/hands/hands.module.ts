import { Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { HandsService } from "./hands.service";
import { HandsController } from "./hands.controller";

@singleton()
export class HandsModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];
	constructor(
		@inject(HandsService) private readonly _service: HandsService,
		@inject(HandsController) private readonly _controller: HandsController
	) {
		this._subscriptions.push(
			this._controller.reset$.subscribe(
				this._service.reset.bind(this._service)
			),
			this._controller.step$.subscribe(({ delta }) => {
				this._service.update(delta);
			}),
			this._controller.pieceSelected$?.subscribe(
				this._service.handlePieceSelected.bind(this._service)
			),
			this._controller.pieceMoving$?.subscribe(
				this._service.handlePieceMoving.bind(this._service)
			),
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
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
