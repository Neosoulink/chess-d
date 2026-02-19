import { ObservablePayload } from "@chess-d/shared";
import { Observable, share } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldController } from "../world.controller";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardController {
	public readonly reset$: Observable<
		ObservablePayload<WorldController["resetDone$$"]>
	>;
	constructor(
		@inject(WorldController)
		private readonly _worldController: WorldController
	) {
		this.reset$ = this._worldController.resetDone$$.pipe(share());
	}
}
