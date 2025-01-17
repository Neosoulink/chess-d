import { inject, singleton } from "tsyringe";

import { BoardService } from "./board.service";
import { PiecesController } from "../pieces/pieces.controller";
import { WorldService } from "../world/world.service";

@singleton()
export class BoardModule {
	constructor(
		@inject(WorldService) private readonly _worldService: WorldService,
		@inject(BoardService)
		public readonly _service: BoardService,
		@inject(PiecesController)
		private readonly _piecesController: PiecesController
	) {
		this._piecesController.pieceDeselected$?.subscribe(() => {
			this._service.setMarkers([]);
		});
	}

	public getInstancedCell() {
		return this._service.instancedCell;
	}

	public getMarkersGroup() {
		return this._service.markersGroup;
	}

	public getPhysics() {
		return this._service.physics;
	}

	public setMarkers(...props: Parameters<BoardService["setMarkers"]>) {
		this._service.setMarkers(...props);
	}

	public init() {
		this._service.initCells();
		this._service.initPhysics();

		this._worldService.scene.add(
			this._service.instancedCell,
			this._service.markersGroup
		);
	}

	public dispose() {}
}
