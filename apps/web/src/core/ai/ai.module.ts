import { container, inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { Observable, Subscription } from "rxjs";
import { WorkerThreadModule } from "@quick-threejs/utils";

@singleton()
export class AiModule implements Module, WorkerThreadModule {
	performMoveSubscription?: Subscription;

	constructor(
		@inject(AiController) public readonly controller: AiController,
		@inject(AiService) public service: AiService
	) {}

	init(): void {
		this.performMoveSubscription = this.controller.performMove$.subscribe(
			() => {
				const move = this.service.performMove();

				if (!move) return;

				this.controller.movePerformed$$.next({
					type: "move_performed",
					payload: move
				});
			}
		);
	}

	dispose(): void {
		this.performMoveSubscription?.unsubscribe();
		this.controller.movePerformed$$.complete();
		this.controller.lifecycle$$.complete();
	}

	lifecycle$() {
		return this.controller.lifecycle$$;
	}
}
