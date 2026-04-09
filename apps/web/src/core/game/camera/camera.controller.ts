import { AppModule } from "@quick-threejs/reactive/worker";
import { filter, Observable, share, switchMap, takeUntil } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";
import { validateFen } from "chess.js";

import { SettingsController } from "../settings/settings.controller";
import { WorldController } from "../world/world.controller";
import { GameController } from "../game.controller";
import { ObservablePayload } from "@chess-d/shared";

@scoped(Lifecycle.ContainerScoped)
export class CameraController {
	public readonly settingsUpdate$: Observable<
		ObservablePayload<SettingsController["update$"]>
	>;
	public readonly introAnimation$: Observable<number>;
	public readonly idleAnimation$: ReturnType<AppModule["timer"]["step$"]>;
	public readonly reset$: Observable<
		ObservablePayload<GameController["reset$"]>
	>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsController)
		private readonly _settingsController: SettingsController,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(WorldController) private readonly _worldController: WorldController
	) {
		this.settingsUpdate$ = this._settingsController.update$.pipe(share());
		this.introAnimation$ = this._worldController.introAnimation$.pipe(share());
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
		this.reset$ = this._gameController.reset$.pipe(share());
	}
}
