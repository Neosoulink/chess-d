import {
	ChessboardModule,
	InstancedCellModel,
	InstancedPieceModel
} from "@chess-d/chessboard";
import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	BOARD_RANGE_CELLS_SIZE,
	ObservablePayload,
	PieceType
} from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	AmbientLight,
	Color,
	ColorManagement,
	DirectionalLight,
	DoubleSide,
	FrontSide,
	Group,
	Material,
	Mesh,
	MeshPhysicalMaterial,
	NoToneMapping,
	Object3DEventMap,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	ShadowMaterial,
	SkinnedMesh,
	SRGBColorSpace
} from "three";
import { inject, singleton } from "tsyringe";

import { InfiniteGridHelper } from "../../../shared/meshes/infinite-grid.mesh";
import {
	Font,
	TextGeometry,
	TextGeometryParameters
} from "three/examples/jsm/Addons.js";
import { HandService } from "../hands/hands.service";
import { WorldController } from "./world.controller";

@singleton()
export class WorldService {
	public readonly scene = new Group();
	public readonly floor = new Group();
	public readonly lights = {
		sun: new DirectionalLight(),
		sunReflection: new DirectionalLight(),
		sunPropagation: new AmbientLight()
	};
	public readonly boardSquareHints = new Group();

	public mainMaterial = new MeshPhysicalMaterial({
		side: DoubleSide,
		sheen: 2,
		roughness: 0.45,
		metalness: 0.02
	});
	public boardMaterial = new MeshPhysicalMaterial({
		side: FrontSide,
		roughness: 0.8,
		metalness: 0.1
	});

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(HandService) private readonly _handService: HandService
	) {
		const floorGrid = new InfiniteGridHelper(
			BOARD_CELL_SIZE,
			BOARD_CELL_SIZE,
			new Color("#bbb"),
			10
		);
		const floorShadow = new Mesh(
			new PlaneGeometry(50, 50),
			new ShadowMaterial({
				opacity: 0.2
			})
		);

		floorGrid.name = "grid";
		floorShadow.name = "shadow";

		this.floor.add(floorGrid, floorShadow);
	}

	public resetRenderer(): void {
		const renderer = this._app.renderer.instance();
		if (!renderer) return;

		ColorManagement.enabled = true;
		renderer.autoClear = true;
		renderer.setClearAlpha(0);
		renderer.setClearColor(new Color(0x000000), 0);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = NoToneMapping;
		renderer.toneMappingExposure = 1;
	}

	public resetCamera(): void {
		const appDebug = this._app.debug;
		const camera = this._app.camera.instance() as PerspectiveCamera;
		const miniCamera = appDebug.miniCamera();
		camera.position.set(0, 12, -9);
		camera.lookAt(0, 0, 0);
		camera.fov = 40;
		camera.near = 0.1;
		camera.far = 100;

		miniCamera?.position.set(6, 2, 0);
	}

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
		const renderer = this._app.renderer.instance();
		if (renderer) {
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.autoUpdate = true;
			renderer.shadowMap.needsUpdate = true;
			renderer.shadowMap.type = PCFSoftShadowMap;
		}

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

	public resetChessboard(): void {
		const chessboard = this._chessboard.world.getScene();
		chessboard.traverseVisible((child) => {
			child.castShadow = true;
			child.receiveShadow = true;

			if (child instanceof InstancedCellModel)
				return (child.material = this.boardMaterial);
			if (child instanceof Mesh) return (child.material = this.mainMaterial);

			return;
		});
	}

	public resetBoardSquareHints(): void {
		const font = this._app.loader.getLoadedResources()["helvetikerFont"] as
			| Font
			| undefined;

		if (!font) return;

		if (!this.boardSquareHints.children.length)
			Array.from(Array(BOARD_MATRIX_RANGE_SIZE).keys()).forEach((i) => {
				const geometryParams: TextGeometryParameters = {
					font,
					size: 0.35,
					height: 0.1,
					depth: 0.01,
					bevelSize: 0.01,
					bevelThickness: 0.01,
					bevelEnabled: true
				};
				const letterGeometry = new TextGeometry(
					(i + 10).toString(36).toUpperCase(),
					geometryParams
				);
				letterGeometry.center();
				letterGeometry.rotateX(-Math.PI / 2);
				letterGeometry.rotateY(Math.PI);

				const numberGeometry = new TextGeometry(`${i + 1}`, geometryParams);
				numberGeometry.center();
				numberGeometry.rotateX(-Math.PI / 2);
				numberGeometry.rotateY(Math.PI);

				const letterMesh = new Mesh(letterGeometry, this.mainMaterial);
				letterMesh.castShadow = true;
				letterMesh.receiveShadow = true;
				letterMesh.position.set(
					BOARD_RANGE_CELLS_HALF_SIZE - BOARD_CELL_SIZE - i,
					0,
					-BOARD_RANGE_CELLS_HALF_SIZE
				);
				letterMesh.scale.setScalar(0);

				const numberMesh = new Mesh(numberGeometry, this.mainMaterial);
				numberMesh.castShadow = true;
				numberMesh.receiveShadow = true;
				numberMesh.position.set(
					BOARD_RANGE_CELLS_HALF_SIZE,
					0,
					-BOARD_RANGE_CELLS_HALF_SIZE + BOARD_CELL_SIZE + i
				);

				this.boardSquareHints.position.setY(-0.1);
				this.boardSquareHints.add(letterMesh, numberMesh);
			});

		this.boardSquareHints.traverse((child) => {
			if (child instanceof Mesh) child.scale.setScalar(0);
		});
	}

	public resetFloor(): void {
		const floorGrid = this.floor.getObjectByName("grid") as
			| InfiniteGridHelper
			| undefined;
		const floorShadow = this.floor.getObjectByName("shadow") as
			| Mesh<PlaneGeometry, ShadowMaterial, Object3DEventMap>
			| undefined;

		if (floorGrid) {
			floorGrid.position.setY(-0.1);
			if (typeof floorGrid.material.uniforms.uDistance?.value === "number")
				floorGrid.material.uniforms.uDistance.value = 0;
		}

		if (floorShadow) {
			floorShadow.receiveShadow = true;
			floorShadow.material.opacity = 0.3;
			floorShadow.rotation.x = -Math.PI / 2;
			floorShadow.position.y = -0.09;
		}

		this.floor.position.setY(-0.09);
	}

	public resetHands(): void {
		Object.values(this._handService.hands).forEach((side) => {
			const mesh = side.scene.children[0]?.children[0] as
				| SkinnedMesh
				| undefined;

			if (
				mesh?.material instanceof Material &&
				(mesh.material as Material).uuid !== this.mainMaterial.uuid
			) {
				mesh.material.dispose();
				mesh.material = this.mainMaterial;
			}
		});
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
		scene.add(
			this.floor,
			this.boardSquareHints,
			this._chessboard.world.getScene(),
			...Object.values(this._handService.hands).map((side) => side.scene),
			...Object.values(this.lights)
		);
	}

	public reset() {
		this.resetRenderer();
		this.resetCamera();
		this.resetLights();
		this.resetShadows();
		this.resetChessboard();
		this.resetBoardSquareHints();
		this.resetFloor();
		this.resetHands();
		this.resetScenes();
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		const piecesGroups = this._chessboard.pieces.getGroups();
		const floorGrid = this.floor.getObjectByName("grid") as InfiniteGridHelper;

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

		if (typeof floorGrid.material.uniforms.uDistance?.value === "number")
			floorGrid.material.uniforms.uDistance.value = progress * 40;

		this.boardSquareHints.traverseVisible((child) => {
			if (child instanceof Mesh) child.scale.setScalar(progress);
		});

		this._app.camera.instance()?.position.copy({
			x: -20 + progress * 20,
			y: progress * 12,
			z: -9 * progress
		});

		this._app.camera.instance()?.lookAt(0, 0, 0);
	}

	public handleIdleAnimation(
		data: ObservablePayload<WorldController["idleAnimation$"]>
	) {
		this._app.camera.instance()?.lookAt(0, 0, 0);
		this._app.camera
			.instance()
			?.position.set(
				Math.sin(data.elapsed * 0.1) * 10,
				12,
				Math.cos(data.elapsed * 0.1) * 10
			);
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
