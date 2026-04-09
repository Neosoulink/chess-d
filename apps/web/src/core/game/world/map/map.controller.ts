import { ObservablePayload } from "@chess-d/shared";
import { Observable, share } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldController } from "../world.controller";
import { SettingsController } from "../../settings/settings.controller";

@scoped(Lifecycle.ContainerScoped)
export class MapController {
	public readonly introAnimation$: WorldController["introAnimation$"];
	public readonly settingsUpdate$: Observable<
		ObservablePayload<SettingsController["update$"]>
	>;
	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;

	constructor(
		@inject(WorldController)
		private readonly _worldController: WorldController,
		@inject(SettingsController)
		private readonly _settingsController: SettingsController
	) {
		this.introAnimation$ = this._worldController.introAnimation$.pipe(share());
		this.settingsUpdate$ = this._settingsController.update$.pipe(share());
		this.reset$ = this._worldController.resetDone$$.pipe(share());
	}
}
