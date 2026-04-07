import {
	ChessboardModule,
	InstancedCellModel,
	InstancedCellMakerModel,
	InstancedPieceModel
} from "@chess-d/chessboard";
import { BOARD_CELL_SIZE, BoardCoord } from "@chess-d/shared";
import {
	CanvasTexture,
	Color,
	DoubleSide,
	FrontSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshPhysicalMaterial,
	PlaneGeometry
} from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldService } from "../world.service";
import { AppModule } from "@quick-threejs/reactive/worker";

@scoped(Lifecycle.ContainerScoped)
export class ChessboardService {
	public scene = new Group();
	public material = new MeshPhysicalMaterial();
	public nextMovesMarker: InstancedCellMakerModel;
	public previousMovesMarker: InstancedCellMakerModel;
	public inDangerMarker: InstancedCellMakerModel;
	public cursorCoordMarker: Mesh;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(WorldService) private readonly _world: WorldService
	) {
		this.nextMovesMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell()
		);
		this.previousMovesMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell()
		);
		this.inDangerMarker = new InstancedCellMakerModel(
			this._chessboard.board.getInstancedCell()
		);
		this.cursorCoordMarker = new Mesh(
			new PlaneGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE),
			new MeshBasicMaterial({
				color: 0xffed68,
				transparent: true,
				opacity: 0.45,
				side: DoubleSide
			})
		);
		this.cursorCoordMarker.visible = false;
		this.cursorCoordMarker.renderOrder = 3;
		this.cursorCoordMarker.rotateX(Math.PI / 2);
		this.cursorCoordMarker.position.set(100, 100, 100);
	}

	public setInDangerMarker(coord: BoardCoord[]) {
		this.inDangerMarker = this.inDangerMarker.set(coord);
	}

	public setNextMovesMarker(coord: BoardCoord[]) {
		this.nextMovesMarker = this.nextMovesMarker.set(coord);
	}

	public setPreviousMovesMarker(coord: BoardCoord[]) {
		this.previousMovesMarker = this.previousMovesMarker.set(coord);
	}

	public handlePieceMoved(coord: (BoardCoord & { captured?: boolean })[]) {
		this.setNextMovesMarker([]);
		this.setPreviousMovesMarker(coord);

		if (coord[coord.length - 1]?.captured)
			this.previousMovesMarker.setColorAt(
				coord.length - 1,
				new Color(0xed2e4f)
			);
	}

	public resetMaterials(): void {
		this.material.color.set(0xffffff);
		this.material.side = FrontSide;
		this.material.transparent = true;
		this.material.opacity = 1;
		this.material.sheen = 2;
		this.material.roughness = 0.8;
		this.material.metalness = 0.1;

		this._chessboard.world.getScene().traverseVisible((child) => {
			if (child instanceof InstancedCellModel) child.material = this.material;
		});
	}

	public resetShadows(): void {
		this._chessboard.world.getScene().traverseVisible((child) => {
			if (
				child instanceof InstancedCellModel ||
				child instanceof InstancedPieceModel
			) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}

	public resetScenes(): void {
		const scene = this.scene;
		const worldScene = this._world.scene;
		const chessboard = this._chessboard.world.getScene();

		scene.clear();
		scene.add(
			chessboard,
			this.nextMovesMarker,
			this.previousMovesMarker,
			this.inDangerMarker,
			this.cursorCoordMarker
		);
		worldScene.add(scene);
	}

	public resetMarkers(): void {
		this.setNextMovesMarker([]);
		this.setPreviousMovesMarker([]);
		this.setInDangerMarker([]);
	}

	public resetVisual(): void {
		this.resetMaterials();
		this.resetShadows();
	}

	public reset(): void {
		this.resetVisual();
		this.resetMarkers();
		this.resetScenes();
	}
}
