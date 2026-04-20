import { Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { PiecesController } from "./pieces.controller";
import { PiecesService } from "./pieces.service";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesService) private readonly _service: PiecesService,
		@inject(PiecesController) private readonly _controller: PiecesController
	) {
		this._subscriptions.push(
			this._controller.resetFen$?.subscribe(
				this._service.resetFen.bind(this._service)
			),
			this._controller.reset$?.subscribe(() => this._service.reset()),
			this._controller.resetMaterials$.subscribe(
				this._service.resetMaterials.bind(this._service)
			),
			this._controller.promoted$?.subscribe(
				this._service.handlePiecePromoted.bind(this._service)
			),
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._controller.introAnimation$?.subscribe(
				this._service.handleIntroAnimation.bind(this._service)
			)
		);
	}

	public init(): void {}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
