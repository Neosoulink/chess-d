import { BufferAttribute } from "three";
import { inject, singleton } from "tsyringe";

import { DebugService } from "./debug.service";
import { DebugController } from "./debug.controller";
import { DEBUG_MODE_TOKEN } from "../../shared";
import { WorldService } from "../world/world.service";

@singleton()
export class DebugModule {
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

		this._controller.physicsDebugRendered$.subscribe({
			next: (buffers) => {
				this._service.lines.geometry.setAttribute(
					"position",
					new BufferAttribute(buffers.vertices, 3)
				);
				this._service.lines.geometry.setAttribute(
					"color",
					new BufferAttribute(buffers.colors, 4)
				);
			}
		});
	}

	public dispose(): void {}
}
