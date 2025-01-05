import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { PiecesComponent } from "./pieces.component";
import { PiecesController } from "./pieces.controller";
import { Subscription } from "rxjs";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesComponent) public readonly component: PiecesComponent,
		@inject(PiecesController)
		public readonly controller: PiecesController
	) {}

	public init() {
		this.component.init();

		this._subscriptions.push(
			this.controller.pieceMoving$?.subscribe(
				this.component.handlePieceMoving.bind(this.component)
			),
			this.controller.pieceDeselected$?.subscribe(
				this.component.handlePieceDeselected.bind(this.component)
			)
		);
	}

	dispose() {
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
