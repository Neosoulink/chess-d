import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";
import { Color } from "chess.js";
import { Module } from "@quick-threejs/reactive";

import { EngineService } from "./engine.service";
import { EngineController } from "./engine.controller";
import { GAME_UPDATED_TOKEN } from "../../../shared/tokens";
import { MessageEventPayload, MoveLike } from "../../../shared/types";

@singleton()
export class EngineModule implements Module {
	private subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(EngineController) private readonly controller: EngineController,
		@inject(EngineService) private readonly service: EngineService
	) {}

	public init() {
		this.subscriptions.push(
			this.controller.pieceSelected$?.subscribe(
				this.service.handlePieceSelected.bind(this.service)
			),
			this.controller.pieceMoved$?.subscribe((payload) => {
				this.service.handlePieceMoved(payload);

				self.postMessage({
					token: GAME_UPDATED_TOKEN,
					value: {
						fen: this.service.getFen(),
						turn: this.service.getTurn(),
						move: payload.nextMove
					}
				} satisfies MessageEventPayload<{
					turn: Color;
					fen: string;
					move?: MoveLike;
				}>);
			})
		);
	}

	public dispose() {
		this.subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.subscriptions = [];
	}
}
