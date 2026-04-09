import { ObservablePayload } from "@chess-d/shared";
import { Observable, share } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { SettingsController } from "../settings/settings.controller";
import { AppModule } from "@quick-threejs/reactive/worker";
import { GameController } from "../game.controller";

@scoped(Lifecycle.ContainerScoped)
export class RendererController {
	public readonly step$: ReturnType<AppModule["timer"]["step$"]>;
	public readonly settingsUpdate$: Observable<
		ObservablePayload<SettingsController["update$"]>
	>;
	public readonly reset$: Observable<
		ObservablePayload<GameController["reset$"]>
	>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(GameController) private readonly _gameController: GameController,
		@inject(SettingsController)
		private readonly _settingsController: SettingsController
	) {
		this.step$ = this._app.timer.step$().pipe(share());
		this.settingsUpdate$ = this._settingsController.update$.pipe(share());
		this.reset$ = this._gameController.reset$.pipe(share());
	}
}
