import { Subscription } from "rxjs";
import { inject, singleton } from "tsyringe";

import { DebugService } from "./debug.service";
import { DebugController } from "./debug.controller";
import { DEBUG_MODE_TOKEN } from "../../shared";
import { WorldService } from "../world/world.service";

@singleton()
export class DebugModule {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(DEBUG_MODE_TOKEN) private readonly _debugMode: boolean,
		@inject(WorldService) private readonly _worldService: WorldService,
		@inject(DebugService) private readonly _service: DebugService,
		@inject(DebugController) private readonly _controller: DebugController
	) {}

	public init(): void {
		this._service.enabled = !!this._debugMode;
		if (this._service.enabled)
			this._worldService.scene.add(this._service.lines);

		this._subscriptions.push(
			this._controller.physicsDebugRendered$.subscribe(
				this._service.handlePhysicsDebugRendered.bind(this._service)
			)
		);
	}

	public dispose(): void {
		this._worldService.scene.remove(this._service.lines);

		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
