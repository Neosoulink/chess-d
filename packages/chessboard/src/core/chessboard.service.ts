import {
	Camera,
	Object3D,
	Object3DEventMap,
	Raycaster,
	Vector2,
	Vector2Like
} from "three";
import { inject, singleton } from "tsyringe";

import { WorldService } from "./world/world.service";
import { CAMERA_TOKEN } from "../shared";

@singleton()
export class ChessboardService {
	public readonly raycaster = new Raycaster();
	public readonly cursor = new Vector2();

	constructor(
		@inject(CAMERA_TOKEN) private readonly _camera: Camera,
		@inject(WorldService) private readonly _worldService: WorldService
	) {}

	public getIntersections<
		T extends Object3D<Object3DEventMap> = Object3D<Object3DEventMap>
	>() {
		return this.raycaster.intersectObjects<T>([this._worldService.scene]);
	}

	update(cursor: Vector2Like) {
		this.cursor.copy(cursor);
		this.raycaster.setFromCamera(this.cursor, this._camera);
	}
}
