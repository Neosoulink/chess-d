import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Module } from "@quick-threejs/reactive";

import { MoveLike, MessageEventPayload } from "../../../shared/types";
import { PIECE_MOVED_TOKEN } from "../../../shared/tokens";
import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesService) public readonly service: PiecesService,
		@inject(PiecesController) public readonly controller: PiecesController
	) {}

	public init(): void {
		self.addEventListener("message", this._onMessage.bind(this));

		this._subscriptions.push(
			this.controller.pieceMoved$$.subscribe(
				this.service.handlePieceMoved.bind(this.service)
			)
		);
	}

	public dispose(): void {
		self.removeEventListener("message", this._onMessage.bind(this));

		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}

	private _onMessage(e: MessageEvent<MessageEventPayload<MoveLike>>): void {
		const move = e.data.value;

		if (e.data?.token === PIECE_MOVED_TOKEN && move?.to)
			this.controller.pieceMoved$$.next(move);
	}
}
