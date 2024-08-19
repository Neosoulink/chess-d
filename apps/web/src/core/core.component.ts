import "reflect-metadata";

import { singleton } from "tsyringe";
import { RapierPhysics } from "@chess-d/rapier-physics";

@singleton()
export class CoreComponent {
	public physics?: Awaited<ReturnType<typeof RapierPhysics>>;

	constructor() {}

	public async init() {
		this.physics = await RapierPhysics();
	}

	public dispose() {}
}
