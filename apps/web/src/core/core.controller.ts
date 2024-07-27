import "reflect-metadata";
import { Subject } from "rxjs";

import { singleton } from "tsyringe";

@singleton()
export class CoreController {
	public readonly gui$$ = new Subject<any>();

	constructor() {}

	public init() {}

	public dispose() {}
}
