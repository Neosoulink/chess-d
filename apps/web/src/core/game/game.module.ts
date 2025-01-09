import { Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, singleton } from "tsyringe";

import { EngineModule } from "./engine/engine.module";
import { HandModule } from "./hands/hands.module";
import { PiecesModule } from "./pieces/pieces.module";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";

@singleton()
export class GameModule implements Module {
	private _subscriptions: Subscription[] = [];

	constructor(
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(HandModule) public readonly hands: HandModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule,
		@inject(GameController) public readonly controller: GameController,
		@inject(GameService) public readonly service: GameService
	) {
		this._subscriptions.push(
			this.controller.piecesWillReset$.subscribe((payload) => {
				const { fen } = payload.data.value || {};

				this.service.reset(fen);
			})
		);
	}

	public init(): void {
		this.hands.init();
		this.pieces.init();
		this.engine.init();
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.hands.dispose();
		this.pieces.dispose();
		this.engine.dispose();
	}
}
