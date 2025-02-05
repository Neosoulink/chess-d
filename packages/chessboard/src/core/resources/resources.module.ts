import { inject, singleton } from "tsyringe";
import { Subscription } from "rxjs";

import { ResourcesService } from "./resources.service";
import { ResourcesController } from "./resources.controller";

@singleton()
export class ResourcesModule {
	private readonly _subscriptions: Subscription[] = [];

	constructor(
		@inject(ResourcesService) private readonly _service: ResourcesService,
		@inject(ResourcesController)
		private readonly _controller: ResourcesController
	) {
		this._subscriptions.push(
			this._controller.updateTypeGeometry$$.subscribe((value) => {
				this._service.setPieceGeometry(value.type, value.geometry);
			})
		);
	}

	public init() {}

	public getPieceGeometry(
		...props: Parameters<ResourcesService["getPieceGeometry"]>
	) {
		return this._service.getPieceGeometry(...props);
	}

	public setPieceGeometry(
		...props: Parameters<ResourcesService["setPieceGeometry"]>
	) {
		this._controller.updateTypeGeometry$$.next({
			type: props[0],
			geometry: props[1]
		});
	}

	public dispose() {}
}
