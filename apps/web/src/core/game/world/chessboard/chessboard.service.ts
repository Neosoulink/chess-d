import { ChessboardModule, InstancedCellModel } from "@chess-d/chessboard";
import { FrontSide, Mesh, MeshPhysicalMaterial } from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldService } from "../world.service";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardService {
	public defaultMaterial = new MeshPhysicalMaterial({
		side: FrontSide,
		roughness: 0.8,
		metalness: 0.1
	});

	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(WorldService) private readonly _world: WorldService
	) {}

	public resetMaterials(): void {
		this._chessboard.world.getScene().traverseVisible((child) => {
			if (child instanceof InstancedCellModel)
				child.material = this.defaultMaterial;
		});
	}

	public resetShadows(): void {
		const chessboard = this._chessboard.world.getScene();

		chessboard.traverseVisible((child) => {
			child.castShadow = true;
			child.receiveShadow = true;
		});
	}

	public resetScenes(): void {
		const scene = this._world.scene;
		const chessboard = this._chessboard.world.getScene();

		chessboard.traverseVisible((child) => {
			child.visible = true;
		});

		scene.add(chessboard);
	}

	public resetVisual(): void {
		this.resetMaterials();
		this.resetShadows();
	}

	public reset(): void {
		this.resetVisual();
		this.resetScenes();
	}
}
