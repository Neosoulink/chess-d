import { AppModule, Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, singleton } from "tsyringe";

import { GAME_STATE_TOKEN } from "../../shared/tokens";
import { MessageEventPayload } from "../../shared/types";
import { EngineModule } from "./engine/engine.module";
import { HandModule } from "./hands/hands.module";
import { PiecesModule } from "./pieces/pieces.module";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { ChessboardModule } from "@chess-d/chessboard";
import { WorldModule } from "./world/world.module";
import { DebugModule } from "./debug/debug.module";

@singleton()
export class GameModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(GameController) private readonly _controller: GameController,
		@inject(GameService) private readonly _service: GameService,
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(WorldModule) public readonly world: WorldModule,
		@inject(HandModule) public readonly hands: HandModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule,
		@inject(DebugModule) public readonly debug: DebugModule
	) {
		this._subscriptions.push(
			this._app
				.mousemove$?.()
				.subscribe(this._service.updateCursorPosition.bind(this._service)),
			this._app.timer.step$().subscribe(({ deltaTime }) => {
				this._chessboard.update({
					cursor: this._service.cursor,
					timestep: deltaTime * 0.0011
				});
			}),
			this._controller.state$.subscribe((value) => {
				self.postMessage({
					token: GAME_STATE_TOKEN,
					value
				} satisfies MessageEventPayload);
			})
		);
	}

	public init(): void {
		this.engine.init();
		this.hands.init();
		this.pieces.init();
		this.world.init();
		this.debug.init();
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.hands.dispose();
		this.pieces.dispose();
		this.engine.dispose();
		this.world.dispose();
	}
}
