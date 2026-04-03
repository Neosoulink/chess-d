import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	BOARD_RANGE_CELLS_SIZE,
	ColorSide,
	ObservablePayload
} from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	AmbientLight,
	CanvasTexture,
	Color,
	DirectionalLight,
	DoubleSide,
	EquirectangularReflectionMapping,
	Group,
	Mesh,
	MeshPhysicalMaterial,
	PlaneGeometry,
	Quaternion,
	ShadowMaterial,
	SRGBColorSpace,
	Texture
} from "three";
import {
	Font,
	GroundedSkybox,
	TextGeometry,
	TextGeometryParameters
} from "three/examples/jsm/Addons.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { InfiniteGridHelper } from "@/shared/meshes";
import { WORLD_MAP_CONFIGS } from "@/shared/constants";
import { WorldService } from "../world.service";
import { WorldController } from "../world.controller";
import { EngineService } from "../../engine/engine.service";

@scoped(Lifecycle.ContainerScoped)
export class MapService {
	public readonly floor = new Group();
	public readonly floorGrid = new InfiniteGridHelper(
		BOARD_CELL_SIZE,
		BOARD_CELL_SIZE,
		undefined,
		10
	);
	public readonly floorShadow = new Mesh(
		new PlaneGeometry(50, 50),
		new ShadowMaterial({
			opacity: 0.2
		})
	);
	public readonly gridLabels = new Group();
	public readonly defaultMaterial = new MeshPhysicalMaterial();
	public readonly lights = {
		sun: new DirectionalLight(),
		sunReflection: new DirectionalLight(),
		sunPropagation: new AmbientLight()
	};

	public skybox?: GroundedSkybox;
	public configs?: (typeof WORLD_MAP_CONFIGS)[number];

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _world: WorldService,
		@inject(EngineService) private readonly _engine: EngineService
	) {
		this.configs = WORLD_MAP_CONFIGS[0];
		this.floor.add(this.floorGrid, this.floorShadow);
	}

	public resetEnvironment(): void {
		const appScene = this._app.world.scene();
		const resources = this._app.loader.getLoadedResources();

		let environmentMap: Texture | null = null;
		let environmentIntensity = 1;
		const environmentRotation = new Quaternion(0, 0, 0, 0);
		let backgroundMap: Texture | null = null;
		let backgroundMapIntensity = 1;
		const backgroundMapRotation = new Quaternion(0, 0, 0, 0);
		let backgroundBlurriness = 0;

		if (this.configs) {
			const envMapId = this.configs.values?.environment?.mapId;
			const backgroundMapId = this.configs.values?.environment?.backgroundMapId;

			if (envMapId) {
				const intensity = this.configs.values?.environment?.intensity;
				const rotation = this.configs.values?.environment?.rotation;

				environmentMap = new CanvasTexture(resources[envMapId]);
				environmentMap.mapping = EquirectangularReflectionMapping;
				environmentMap.colorSpace = SRGBColorSpace;
				environmentMap.needsUpdate = true;

				if (typeof intensity === "number") environmentIntensity = intensity;
				if (rotation)
					environmentRotation.set(
						rotation.x ?? 0,
						rotation.y ?? 0,
						rotation.z ?? 0,
						rotation.w ?? 0
					);
			}

			if (backgroundMapId) {
				const intensity =
					this.configs.values?.environment?.backgroundMapIntensity;
				const rotation =
					this.configs.values?.environment?.backgroundMapRotation;
				const blurriness =
					this.configs.values?.environment?.backgroundBlurriness;

				backgroundMap = new CanvasTexture(resources[backgroundMapId]);
				backgroundMap.mapping = EquirectangularReflectionMapping;
				backgroundMap.colorSpace = SRGBColorSpace;
				backgroundMap.needsUpdate = true;

				if (typeof intensity === "number") backgroundMapIntensity = intensity;
				if (rotation)
					backgroundMapRotation.set(
						rotation.x ?? 0,
						rotation.y ?? 0,
						rotation.z ?? 0,
						rotation.w ?? 0
					);
				if (typeof blurriness === "number") backgroundBlurriness = blurriness;
			}
		}

		appScene.environment = environmentMap;
		appScene.environmentIntensity = environmentIntensity;
		appScene.environmentRotation.setFromQuaternion(environmentRotation);
		appScene.background = backgroundMap;
		appScene.backgroundIntensity = backgroundMapIntensity;
		appScene.backgroundRotation.setFromQuaternion(backgroundMapRotation);
		appScene.backgroundBlurriness = backgroundBlurriness;
	}

	public resetSkybox(): void {
		const resources = this._app.loader.getLoadedResources();
		const mapId = this.configs?.values?.skybox?.mapId;

		if (this.skybox) {
			this.skybox.removeFromParent();
			this.skybox.geometry.dispose();
			this.skybox.material.map?.dispose();
			this.skybox.material.dispose();
			this.skybox = undefined;
		}

		if (!this.configs || !mapId) return;

		const backgroundTexture = new CanvasTexture(resources[mapId]);
		backgroundTexture.mapping = EquirectangularReflectionMapping;
		backgroundTexture.colorSpace = SRGBColorSpace;
		backgroundTexture.needsUpdate = true;

		this.skybox = new GroundedSkybox(
			backgroundTexture,
			this.configs.values?.skybox?.height ?? 15,
			this.configs.values?.skybox?.radius ?? 50,
			this.configs.values?.skybox?.resolution ?? undefined
		);
		this.skybox.position.set(
			this.configs.values?.skybox?.position?.x ?? 0,
			this.configs.values?.skybox?.position?.y ?? 0,
			this.configs.values?.skybox?.position?.z ?? 0
		);
		this.skybox.rotation.setFromQuaternion(
			new Quaternion(
				this.configs.values?.skybox?.rotation?.x ?? 0,
				this.configs.values?.skybox?.rotation?.y ?? 0,
				this.configs.values?.skybox?.rotation?.z ?? 0,
				this.configs.values?.skybox?.rotation?.w ?? 0
			)
		);
		this.skybox.material.color.setScalar(
			this.configs.values?.skybox?.intensity ?? 1
		);
	}

	public resetLights(): void {
		this.lights.sun.visible = this.configs?.values?.lights?.sunVisible ?? true;
		this.lights.sun.color = new Color(
			this.configs?.values?.lights?.sunColor ?? "#fff"
		);
		this.lights.sun.intensity =
			this.configs?.values?.lights?.sunIntensity ?? 1.1;
		this.lights.sun.position.set(
			this.configs?.values?.lights?.sunPosition?.x ?? -1,
			this.configs?.values?.lights?.sunPosition?.y ?? 4,
			this.configs?.values?.lights?.sunPosition?.z ?? 2
		);
		this.lights.sun.lookAt(
			this.configs?.values?.lights?.sunLookAt?.x ?? 0,
			this.configs?.values?.lights?.sunLookAt?.y ?? 0,
			this.configs?.values?.lights?.sunLookAt?.z ?? 0
		);

		this.lights.sunReflection.visible =
			this.configs?.values?.lights?.sunReflectionVisible ?? true;
		this.lights.sunReflection.color = this.configs?.values?.lights
			?.sunReflectionColor
			? new Color(this.configs?.values?.lights?.sunReflectionColor ?? "#fff")
			: this.lights.sun.color.clone();
		this.lights.sunReflection.intensity =
			this.configs?.values?.lights?.sunReflectionIntensity ?? 1;
		this.lights.sunReflection.position.set(
			this.configs?.values?.lights?.sunReflectionPosition?.x ??
				this.lights.sun.position.x * -1,
			this.configs?.values?.lights?.sunReflectionPosition?.y ??
				this.lights.sun.position.y,
			this.configs?.values?.lights?.sunReflectionPosition?.z ??
				this.lights.sun.position.z * -1
		);
		this.lights.sunReflection.lookAt(
			this.configs?.values?.lights?.sunReflectionLookAt?.x ?? 0,
			this.configs?.values?.lights?.sunReflectionLookAt?.y ?? 0,
			this.configs?.values?.lights?.sunReflectionLookAt?.z ?? 0
		);

		this.lights.sunPropagation.visible =
			this.configs?.values?.lights?.sunPropagationVisible ?? true;
		this.lights.sunPropagation.color = this.configs?.values?.lights
			?.sunPropagationColor
			? new Color(this.configs?.values?.lights?.sunPropagationColor ?? "#fff")
			: this.lights.sun.color.clone();
		this.lights.sunPropagation.intensity =
			this.configs?.values?.lights?.sunPropagationIntensity ?? 1;
	}

	public resetShadows(): void {
		this.lights.sun.castShadow =
			this.configs?.values?.lights?.sunCastShadow ?? true;
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

		this.lights.sunReflection.castShadow =
			this.configs?.values?.lights?.sunReflectionCastShadow ?? false;
		this.lights.sunReflection.shadow.bias = 0;
		this.lights.sunReflection.shadow.normalBias = 0.05;
		this.lights.sunReflection.shadow.mapSize.set(2048, 2048);
		this.lights.sunReflection.shadow.map?.setSize(2048, 2048);
		this.lights.sunReflection.shadow.camera.far = 50;
		this.lights.sunReflection.shadow.camera.near = 0.1;
		this.lights.sunReflection.shadow.camera.top = BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.bottom = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.left = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.right = BOARD_RANGE_CELLS_SIZE;
	}

	public resetMaterials(): void {
		this.defaultMaterial.side = DoubleSide;
		this.defaultMaterial.color = new Color("#fff");
		this.defaultMaterial.transparent = true;
		this.defaultMaterial.opacity = 1;
		this.defaultMaterial.sheen = 2;
		this.defaultMaterial.roughness = 0.45;
		this.defaultMaterial.metalness = 0.02;
	}

	public resetFloor(): void {
		const isEnabled = this.configs?.values?.floor?.enabled ?? true;
		const isEnabledGrids = this.configs?.values?.floor?.enabledGrids ?? true;
		const isEnabledShadow = this.configs?.values?.floor?.enabledShadow ?? true;

		this.floor.visible = isEnabled;
		this.floor.position.setY(-0.09);

		this.floorGrid.visible = isEnabledGrids;
		this.floorGrid.position.setY(-0.1);
		if (typeof this.floorGrid.material.uniforms.uDistance?.value === "number")
			this.floorGrid.material.uniforms.uDistance.value = 0;

		this.floorShadow.visible = isEnabledShadow;
		this.floorShadow.receiveShadow = true;
		this.floorShadow.material.opacity =
			this.configs?.values?.floor?.shadowOpacity ?? 0.35;
		this.floorShadow.rotation.x = -Math.PI / 2;
		this.floorShadow.position.y = -0.09;
	}

	public resetGridsLabels(): void {
		const font = this._app.loader.getLoadedResources()["helvetikerFont"] as
			| Font
			| undefined;
		if (!font) return;

		const boardMatrixKeys = Array.from(Array(BOARD_MATRIX_RANGE_SIZE).keys());
		const isPlayerSideWhite = this._engine.state.playerSide === ColorSide.white;
		const lettersGroup = new Group();
		const numbersGroup = new Group();

		this.gridLabels.clear();

		boardMatrixKeys.forEach((i) => {
			const geometryParams: TextGeometryParameters = {
				font,
				size: 0.35,
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

			const letterMesh = new Mesh(letterGeometry, this.defaultMaterial);
			letterMesh.name = `letter-${i}`;
			letterMesh.castShadow = true;
			letterMesh.receiveShadow = true;
			letterMesh.position.set(
				isPlayerSideWhite
					? BOARD_RANGE_CELLS_HALF_SIZE - BOARD_CELL_SIZE - i
					: -BOARD_RANGE_CELLS_HALF_SIZE + BOARD_CELL_SIZE + i,
				0,
				-BOARD_RANGE_CELLS_HALF_SIZE
			);
			letterMesh.scale.setScalar(0);

			const numberMesh = new Mesh(numberGeometry, this.defaultMaterial);
			numberMesh.name = `number-${i}`;
			numberMesh.castShadow = true;
			numberMesh.receiveShadow = true;
			numberMesh.position.set(
				BOARD_RANGE_CELLS_HALF_SIZE,
				0,
				isPlayerSideWhite
					? -BOARD_RANGE_CELLS_HALF_SIZE + BOARD_CELL_SIZE + i
					: BOARD_RANGE_CELLS_HALF_SIZE - BOARD_CELL_SIZE - i
			);

			lettersGroup.add(letterMesh);
			numbersGroup.add(numberMesh);
		});

		this.gridLabels.add(lettersGroup, numbersGroup);
		this.gridLabels.position.setY(-0.1);
		if (!isPlayerSideWhite) this.gridLabels.rotation.y = Math.PI;
		this.gridLabels.traverse((child) => {
			if (child instanceof Mesh) child.scale.setScalar(0);
		});
	}

	public resetScenes(): void {
		const appScene = this._app.world.scene();
		const scene = this._world.scene;

		scene.add(...Object.values(this.lights), this.floor, this.gridLabels);
		if (this.skybox) appScene.add(this.skybox);
	}

	public reset() {
		this.resetEnvironment();
		this.resetLights();
		this.resetSkybox();
		this.resetShadows();
		this.resetMaterials();
		this.resetFloor();
		this.resetGridsLabels();
		this.resetScenes();
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		if (typeof this.floorGrid.material.uniforms.uDistance?.value === "number")
			this.floorGrid.material.uniforms.uDistance.value = progress * 40;

		this.gridLabels.traverseVisible((child) => {
			if (child instanceof Mesh) child.scale.setScalar(progress);
		});
	}
}
