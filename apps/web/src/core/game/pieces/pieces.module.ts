import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: Subscription[] = [];

	constructor(
		@inject(PiecesService) public readonly service: PiecesService,
		@inject(PiecesController) public readonly controller: PiecesController
	) {}

	public init(): void {
		this._subscriptions.push(
			this.controller.animatedPlayerMovedPiece$?.subscribe(
				this.service.handleAnimatedPlayerMovedPiece.bind(this.service)
			)
		);
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
