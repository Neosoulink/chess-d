import { ChessboardModule, InstancedPieceModel } from "@chess-d/chessboard";
import {
	BOARD_RANGE_CELLS_SIZE,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	AmbientLight,
	Color,
	DirectionalLight,
	DoubleSide,
	Group,
	MeshPhysicalMaterial
} from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import type { WorldController } from "./world.controller";

@scoped(Lifecycle.ContainerScoped)
export class WorldService {
	public readonly scene = new Group();
	public readonly lights = {
		sun: new DirectionalLight(),
		sunReflection: new DirectionalLight(),
		sunPropagation: new AmbientLight()
	};

	public defaultMaterial = new MeshPhysicalMaterial({
		side: DoubleSide,
		sheen: 2,
		roughness: 0.45,
		metalness: 0.02
	});

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule
	) {}

	public resetLights(): void {
		this.lights.sun.visible = true;
		this.lights.sun.color = new Color("#fff");
		this.lights.sun.intensity = 1.1;
		this.lights.sun.position.set(-1, 4, 2);

		this.lights.sunReflection.visible = true;
		this.lights.sunReflection.color = this.lights.sun.color;
		this.lights.sunReflection.intensity = 1;
		this.lights.sunReflection.position.set(
			this.lights.sun.position.x * -1,
			this.lights.sun.position.y,
			this.lights.sun.position.z * -1
		);

		this.lights.sunReflection.visible = true;
		this.lights.sunPropagation.color = this.lights.sun.color;
		this.lights.sunPropagation.intensity = 1;
	}

	public resetShadows(): void {
		this.lights.sun.castShadow = true;
		this.lights.sun.shadow.bias = 0;
		this.lights.sun.shadow.normalBias = 0.05;
		this.lights.sun.shadow.mapSize.set(2048, 2048);
		this.lights.sun.shadow.map?.setSize(2048, 2048);
		this.lights.sun.shadow.camera.far = 50;
		this.lights.sun.shadow.camera.near = 0.1;
		this.lights.sun.shadow.camera.top = BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.bottom = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.left = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.right = BOARD_RANGE_CELLS_SIZE;
	}

	public resetEnvironment(): void {
		const scene = this._app.world.scene();

		scene.environmentRotation.set(0, 0, 0, "XYZ");
		scene.environmentIntensity = 1;
	}

	public resetScenes(): void {
		const scene = this.scene;

		scene.rotation.y = 0;
		scene.clear();
		scene.add(...Object.values(this.lights));
	}

	public reset() {
		this.resetLights();
		this.resetShadows();
		this.resetScenes();
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		const piecesGroups = this._chessboard.pieces.getGroups();

		Object.values(piecesGroups).forEach((group) => {
			Object.values(group).forEach((instancedPiece) => {
				if (instancedPiece instanceof InstancedPieceModel)
					for (
						let pieceInstanceId = 0;
						pieceInstanceId < instancedPiece.count || 0;
						pieceInstanceId++
					) {
						const geometry = instancedPiece.geometry;
						const geometryHight = geometry.boundingBox?.max.y || 0;
						const piece = instancedPiece?.getPieceByInstanceId(pieceInstanceId);

						if (piece) {
							this._chessboard.pieces.setPiecePosition(piece, {
								...piece.position,
								y:
									PieceType.pawn === piece.type
										? geometryHight + 1.05 - progress
										: progress > 0.3
											? geometryHight + 1.05 - (progress - 0.3) * 1.43
											: geometryHight + 1.05
							});
						}
					}
			});
		});
	}

	public init() {
		this._app.world.scene().add(this.scene);
	}

	public update(): void {}

	public dispose() {
		this.scene.removeFromParent();
		this.scene.clear();
	}
}
