import { WorkerThreadModule } from "@quick-threejs/worker";
import { Module } from "@quick-threejs/reactive";
import { inject, Lifecycle, scoped } from "tsyringe";
import { filter, from, mergeMap, Subscription } from "rxjs";

import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AI_PERFORMED_MOVE_TOKEN } from "../../shared/tokens";

@scoped(Lifecycle.ContainerScoped)
export class AiModule implements Module, WorkerThreadModule {
	private _subscriptions: Subscription[] = [];

	constructor(
		@inject(AiController) public readonly controller: AiController,
		@inject(AiService) public service: AiService
	) {}

	init(): void {
		this._subscriptions.push(
			this.controller.willPerformMove$
				.pipe(
					mergeMap((payload) =>
						from(this.service.handleWillPerformMove(payload.data.value!))
					),
					filter((move): move is NonNullable<typeof move> => !!move)
				)
				.subscribe((move) => {
					this.controller.movePerformed$$.next({
						token: AI_PERFORMED_MOVE_TOKEN,
						value: { move }
					});
				})
		);
	}

	dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
