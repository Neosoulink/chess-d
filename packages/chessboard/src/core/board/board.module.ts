import { Subscription } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { BoardService } from "./board.service";
import { WorldService } from "../world/world.service";
import { BoardController } from "./board.controller";

@scoped(Lifecycle.ContainerScoped)
export class BoardModule {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(WorldService) private readonly _worldService: WorldService,
		@inject(BoardService)
		public readonly _service: BoardService,
		@inject(BoardController)
		private readonly _boardController: BoardController
	) {}

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
