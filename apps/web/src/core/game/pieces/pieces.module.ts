import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { PIECE_WILL_MOVE_TOKEN } from "../../../shared/tokens";
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
			this.controller.playerMovedPiece$$.subscribe(
				this.service.handlePlayerMovedPiece.bind(this.service)
			),
			this.controller.pieceWillMove$.subscribe((payload) => {
				const move = payload.data.value;

				console.log("move", move);

				if (payload.data?.token === PIECE_WILL_MOVE_TOKEN && move?.to)
					this.controller.playerMovedPiece$$.next(move);
			})
		);
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
