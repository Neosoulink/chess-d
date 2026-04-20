import { Subscription } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { BoardService } from "./board.service";
@scoped(Lifecycle.ContainerScoped)
export class BoardModule {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(@inject(BoardService) public readonly _service: BoardService) {}

	public getInstancedCell() {
		return this._service.instancedCell;
	}

	public getPhysics() {
		return this._service.physics;
	}

	public init() {
		this._service.initCells();
		this._service.initPhysics();
		this._service.initScene();
	}

	public dispose() {
		this._service.disposePhysics();
		this._service.disposeScene();
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
