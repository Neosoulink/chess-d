import "reflect-metadata";

import { singleton } from "tsyringe";

@singleton()
export class CoreComponent {
	constructor() {}

	public dispose() {}
}
