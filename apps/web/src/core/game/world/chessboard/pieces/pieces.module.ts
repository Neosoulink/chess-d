import { Module } from "@quick-threejs/reactive";
import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesService) private readonly _service: PiecesService,
		@inject(PiecesController) private readonly _controller: PiecesController
	) {
		this._subscriptions.push(
			this._controller.resetFen$?.subscribe((fen) =>
				this._service.resetFen(fen)
			),
			this._controller.reset$?.subscribe(() => this._service.reset()),
			this._controller.animatedPlayerMovedPiece$?.subscribe(
				this._service.handleAnimatedPlayerMovedPiece.bind(this._service)
			),
			this._controller.promoted$?.subscribe(
				this._service.handlePiecePromoted.bind(this._service)
			)
		);
	}

	public init(): void {}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
