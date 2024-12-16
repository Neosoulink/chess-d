import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { PiecesComponent } from "./pieces.component";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesModule implements Module {
	constructor(
		@inject(PiecesComponent) public readonly component: PiecesComponent,
		@inject(PiecesController)
		public readonly controller: PiecesController
	) {}

	public init() {
		this.component.initialize();

		this.controller.pieceMoving$?.subscribe(
			this.component.handlePieceMoving.bind(this.component)
		);

		this.controller.pieceDeselected$?.subscribe((payload) => {
			this.component.handlePieceDeselected(payload);
			this.controller.pieceMoved$$.next(payload);
		});
	}

	dispose() {}
}
