import { inject, singleton } from "tsyringe";

import { WorldService } from "./world.service";

@singleton()
export class WorldModule {
	constructor(@inject(WorldService) private readonly _service: WorldService) {}

	public init() {}

	public getScene() {
		return this._service.scene;
	}

	public dispose() {}
}
