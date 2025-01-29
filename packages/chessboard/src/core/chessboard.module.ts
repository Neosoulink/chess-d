import { inject, singleton } from "tsyringe";
import { Physics } from "@chess-d/rapier";

import { ChessboardService } from "./chessboard.service";
import { ChessboardController } from "./chessboard.controller";
import { ResourceModule } from "./resource/resource.module";
import { WorldModule } from "./world/world.module";
import { BoardModule } from "./board/board.module";
import { PiecesModule } from "./pieces/pieces.module";
import { DebugModule } from "./debug/debug.module";
import { Subscription } from "rxjs";
import { ObservablePayload } from "@chess-d/shared";

@singleton()
export class ChessboardModule {
	private readonly _subscriptions: Subscription[] = [];

	constructor(
		@inject(ChessboardService) private readonly _service: ChessboardService,
		@inject(ChessboardController)
		private readonly _controller: ChessboardController,
		@inject(Physics) public readonly physics: Physics,
		@inject(ResourceModule) public readonly resource: ResourceModule,
		@inject(WorldModule) public readonly world: WorldModule,
		@inject(BoardModule) public readonly board: BoardModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule,
		@inject(DebugModule) public readonly debug: DebugModule
	) {
		this.init();
	}

	public init() {
		this.resource.init();
		this.world.init();
		this.board.init();
		this.pieces.init();
		this.debug.init();

		this._subscriptions.push(
			this._controller.update$$.subscribe(({ cursor, timestep }) => {
				this._service.update(cursor);
				this.physics.step(timestep);
			})
		);
	}

	public update(payload: ObservablePayload<ChessboardController["update$$"]>) {
		this._controller.update$$.next(payload);
	}

	public dispose() {
		this.resource.dispose();
		this.world.dispose();
		this.board.dispose();
		this.pieces.dispose();
		this.debug.dispose();

		this._subscriptions.forEach((sub) => sub.unsubscribe());
	}
}
