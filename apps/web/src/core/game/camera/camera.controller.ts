import { AppModule } from "@quick-threejs/reactive/worker";
import { filter, Observable, switchMap, takeUntil } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldController } from "../world/world.controller";
import { GameController } from "../game.controller";
import { validateFen } from "chess.js";

@scoped(Lifecycle.ContainerScoped)
export class CameraController {
	public readonly introAnimation$: Observable<number>;
	public readonly idleAnimation$: ReturnType<AppModule["timer"]["step$"]>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(WorldController) private readonly _worldController: WorldController
	) {
		this.introAnimation$ = this._worldController.introAnimation$;
		this.idleAnimation$ = this._gameController.reset$.pipe(
			filter((data) => !validateFen(`${data?.fen}`).ok),
			switchMap(() => {
				return this._app.timer
					.step$()
					.pipe(
						takeUntil(
							this._gameController.reset$.pipe(
								filter((data) => validateFen(`${data?.fen}`).ok)
							)
						)
					);
			})
		);
	}
}
