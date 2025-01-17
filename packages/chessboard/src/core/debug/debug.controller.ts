import { inject, singleton } from "tsyringe";
import { filter, map, Observable, share } from "rxjs";
import { Physics } from "@chess-d/rapier";

import { DebugService } from "./debug.service";
import { ChessboardController } from "../chessboard.controller";

@singleton()
export class DebugController {
	public readonly physicsDebugRendered$: Observable<
		InstanceType<Physics["rapier"]["DebugRenderBuffers"]>
	>;

	constructor(
		@inject(DebugService) private readonly _service: DebugService,
		@inject(ChessboardController)
		private readonly _chessboardController: ChessboardController,
		@inject(Physics) private readonly _physics: Physics
	) {
		this.physicsDebugRendered$ = this._chessboardController.update$$.pipe(
			filter(() => !!this._service?.enabled),
			map(() => this._physics.world.debugRender()),
			share()
		);
	}
}
