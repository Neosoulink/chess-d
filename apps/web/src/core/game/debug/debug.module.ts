import { Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, singleton } from "tsyringe";

import { DebugController } from "./debug.controller";
import { DebugService } from "./debug.service";

@singleton()
export class DebugModule implements Module {
	private readonly _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(DebugService) private readonly _service: DebugService,
		@inject(DebugController) private readonly _controller: DebugController
	) {
		this._subscriptions.push(
			this._controller.message$.subscribe(
				this._service.handlePaneChange.bind(this._service)
			)
		);
	}

	init() {
		this._service.handleDebugEnabledChange(this._service.enabled);
	}

	dispose() {
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
	}
}
