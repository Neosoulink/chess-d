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
	EquirectangularReflectionMapping,
	Group,
	Mesh,
	MeshLambertMaterial,
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

import { WORLD_MAP_THEME_PRESETS_CONFIGS } from "@/shared/constants";
import { WorldService } from "../world.service";
import { WorldController } from "../world.controller";
import { EngineService } from "../../engine/engine.service";
import { SettingsService } from "../../settings/settings.service";

@scoped(Lifecycle.ContainerScoped)
export class MapService {
	public readonly scene = new Group();
	public readonly labelsScene = new Group();
	public readonly floorShadow = new Mesh(
		new PlaneGeometry(50, 50),
		new ShadowMaterial({
			opacity: 0.2
		})
	);
	public readonly material = new MeshLambertMaterial();
	public readonly lights = {
		sun: new DirectionalLight(),
		sunReflection: new DirectionalLight(),
		sunPropagation: new AmbientLight()
	};

	public skybox?: GroundedSkybox;
	public themePreset?: (typeof WORLD_MAP_THEME_PRESETS_CONFIGS)[number];

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsService) private readonly _settings: SettingsService,
		@inject(WorldService) private readonly _world: WorldService,
		@inject(EngineService) private readonly _engine: EngineService
	) {
		this.scene.name = "world-map";
		this.floorShadow.name = "world-map-floor-shadow";
		this.labelsScene.name = "world-map-labels";
	}

	public resetSettings(): void {
		const settingsState = this._settings.state;
		this.themePreset = WORLD_MAP_THEME_PRESETS_CONFIGS.find(
			(config) =>
				config.id ===
				settingsState["visual-theme"]?.params["background-style"]?.value
		);
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

		if (this.themePreset) {
			const envMapId = this.themePreset.values?.environment?.mapId;
			const backgroundMapId =
				this.themePreset.values?.environment?.backgroundMapId;

			if (envMapId) {
				const intensity = this.themePreset.values?.environment?.intensity;
				const rotation = this.themePreset.values?.environment?.rotation;

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
					this.themePreset.values?.environment?.backgroundMapIntensity;
				const rotation =
					this.themePreset.values?.environment?.backgroundMapRotation;
				const blurriness =
					this.themePreset.values?.environment?.backgroundBlurriness;

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
		const mapId = this.themePreset?.values?.skybox?.mapId;

		if (this.skybox) {
			this.skybox.removeFromParent();
			this.skybox.geometry.dispose();
			this.skybox.material.map?.dispose();
			this.skybox.material.dispose();
			this.skybox.traverse((child) => {
				if (child instanceof Mesh) {
					child.geometry.dispose();
					child.material.map?.dispose();
					child.material.dispose();
				}
			});
			this.skybox = undefined;
		}

		if (!this.themePreset || !mapId) return;

		const backgroundTexture = new CanvasTexture(resources[mapId]);
		backgroundTexture.mapping = EquirectangularReflectionMapping;
		backgroundTexture.colorSpace = SRGBColorSpace;
		backgroundTexture.needsUpdate = true;

		this.skybox = new GroundedSkybox(
			backgroundTexture,
			this.themePreset.values?.skybox?.height ?? 15,
			this.themePreset.values?.skybox?.radius ?? 50,
			this.themePreset.values?.skybox?.resolution ?? undefined
		);
		this.skybox.position.set(
			this.themePreset.values?.skybox?.position?.x ?? 0,
			this.themePreset.values?.skybox?.position?.y ?? 0,
			this.themePreset.values?.skybox?.position?.z ?? 0
		);
		this.skybox.rotation.setFromQuaternion(
			new Quaternion(
				this.themePreset.values?.skybox?.rotation?.x ?? 0,
				this.themePreset.values?.skybox?.rotation?.y ?? 0,
				this.themePreset.values?.skybox?.rotation?.z ?? 0,
				this.themePreset.values?.skybox?.rotation?.w ?? 0
			)
		);
		this.skybox.material.color.setScalar(
			this.themePreset.values?.skybox?.intensity ?? 1
		);
	}

	public resetLights(): void {
		this.lights.sun.visible =
			this.themePreset?.values?.lights?.sunVisible ?? true;
		this.lights.sun.color = new Color(
			this.themePreset?.values?.lights?.sunColor ?? "#fff"
		);
		this.lights.sun.intensity =
			this.themePreset?.values?.lights?.sunIntensity ?? 1.1;
		this.lights.sun.position.set(
			this.themePreset?.values?.lights?.sunPosition?.x ?? -1,
			this.themePreset?.values?.lights?.sunPosition?.y ?? 4,
			this.themePreset?.values?.lights?.sunPosition?.z ?? 2
		);
		this.lights.sun.lookAt(
			this.themePreset?.values?.lights?.sunLookAt?.x ?? 0,
			this.themePreset?.values?.lights?.sunLookAt?.y ?? 0,
			this.themePreset?.values?.lights?.sunLookAt?.z ?? 0
		);

		this.lights.sunReflection.visible =
			this.themePreset?.values?.lights?.sunReflectionVisible ?? true;
		this.lights.sunReflection.color = this.themePreset?.values?.lights
			?.sunReflectionColor
			? new Color(
					this.themePreset?.values?.lights?.sunReflectionColor ?? "#fff"
				)
			: this.lights.sun.color.clone();
		this.lights.sunReflection.intensity =
			this.themePreset?.values?.lights?.sunReflectionIntensity ?? 1;
		this.lights.sunReflection.position.set(
			this.themePreset?.values?.lights?.sunReflectionPosition?.x ??
				this.lights.sun.position.x * -1,
			this.themePreset?.values?.lights?.sunReflectionPosition?.y ??
				this.lights.sun.position.y,
			this.themePreset?.values?.lights?.sunReflectionPosition?.z ??
				this.lights.sun.position.z * -1
		);
		this.lights.sunReflection.lookAt(
			this.themePreset?.values?.lights?.sunReflectionLookAt?.x ?? 0,
			this.themePreset?.values?.lights?.sunReflectionLookAt?.y ?? 0,
			this.themePreset?.values?.lights?.sunReflectionLookAt?.z ?? 0
		);

		this.lights.sunPropagation.visible =
			this.themePreset?.values?.lights?.sunPropagationVisible ?? true;
		this.lights.sunPropagation.color = this.themePreset?.values?.lights
			?.sunPropagationColor
			? new Color(
					this.themePreset?.values?.lights?.sunPropagationColor ?? "#fff"
				)
			: this.lights.sun.color.clone();
		this.lights.sunPropagation.intensity =
			this.themePreset?.values?.lights?.sunPropagationIntensity ?? 1;
	}

	public resetShadows(): void {
		const isEnabled =
			typeof this._settings.state["lights-shadows"]?.params["enable-shadows"]
				?.value === "boolean"
				? this._settings.state["lights-shadows"]?.params["enable-shadows"]
						?.value
				: true;
		const isFloorEnabled =
			this.themePreset?.values?.floor?.enabledShadow ?? true;
		const graphicsQuality =
			this._settings.state["visual-theme"]?.params["graphics-quality"]?.value;
		const shadowMapSize =
			graphicsQuality === "low" ? 256 : graphicsQuality === "high" ? 1024 : 512;
		const shadowRadius =
			graphicsQuality === "low" ? 1.5 : graphicsQuality === "high" ? 2.5 : 2.25;
		this.lights.sun.castShadow =
			isEnabled && (this.themePreset?.values?.lights?.sunCastShadow ?? true);
		this.lights.sun.shadow.bias = 0;
		this.lights.sun.shadow.normalBias = 0.05;
		this.lights.sun.shadow.radius = shadowRadius;
		this.lights.sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
		this.lights.sun.shadow.map?.setSize(shadowMapSize, shadowMapSize);
		this.lights.sun.shadow.camera.far = BOARD_RANGE_CELLS_SIZE * 2.25;
		this.lights.sun.shadow.camera.near = 0.1;
		this.lights.sun.shadow.camera.top = BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.bottom = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.left = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sun.shadow.camera.right = BOARD_RANGE_CELLS_SIZE;

		this.lights.sunReflection.castShadow =
			isEnabled &&
			(this.themePreset?.values?.lights?.sunReflectionCastShadow ?? false);
		this.lights.sunReflection.shadow.bias = 0;
		this.lights.sunReflection.shadow.normalBias = 0.05;
		this.lights.sunReflection.shadow.radius = shadowRadius;
		this.lights.sunReflection.shadow.mapSize.set(shadowMapSize, shadowMapSize);
		this.lights.sunReflection.shadow.map?.setSize(shadowMapSize, shadowMapSize);
		this.lights.sunReflection.shadow.camera.far = BOARD_RANGE_CELLS_SIZE * 2.25;
		this.lights.sunReflection.shadow.camera.near = 0.1;
		this.lights.sunReflection.shadow.camera.top = BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.bottom = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.left = -BOARD_RANGE_CELLS_SIZE;
		this.lights.sunReflection.shadow.camera.right = BOARD_RANGE_CELLS_SIZE;

		this.floorShadow.visible = isEnabled && isFloorEnabled;
		this.floorShadow.receiveShadow = isEnabled;
		this.floorShadow.material.opacity =
			this.themePreset?.values?.floor?.shadowOpacity ?? 0.35;
	}

	public resetMaterials(): void {
		this.material.color = new Color("#fff");
		this.material.transparent = true;
		this.material.opacity = 1;
	}

	public resetFloor(): void {
		this.floorShadow.rotation.x = -Math.PI / 2;
		this.floorShadow.position.y = -0.18;
	}

	public resetGridsLabels(): void {
		const font = this._app.loader.getLoadedResources()[
			"font-helvetiker-regular"
		] as Font | undefined;
		if (!font) return;

		const boardMatrixKeys = Array.from(Array(BOARD_MATRIX_RANGE_SIZE).keys());
		const isPlayerSideWhite = this._engine.state.playerSide === ColorSide.white;
		const lettersGroup = new Group();
		const numbersGroup = new Group();

		this.labelsScene.traverseVisible((child) => {
			if (child instanceof Mesh) child.geometry.dispose();
		});
		this.labelsScene.clear();

		lettersGroup.name = "letters";
		numbersGroup.name = "numbers";

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

			const letterMesh = new Mesh(letterGeometry, this.material);
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

			const numberMesh = new Mesh(numberGeometry, this.material);
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

		this.labelsScene.add(lettersGroup, numbersGroup);
		this.labelsScene.position.setY(-0.1);
		if (!isPlayerSideWhite) this.labelsScene.rotation.y = Math.PI;
		this.labelsScene.traverse((child) => {
			if (child instanceof Mesh) child.scale.setScalar(0);
		});
	}

	public resetScenes(): void {
		const appScene = this._app.world.scene();
		const worldScene = this._world.scene;

		this.scene.clear();

		this.scene.add(
			...Object.values(this.lights),
			this.floorShadow,
			this.labelsScene
		);
		worldScene.add(this.scene);
		if (this.skybox) appScene.add(this.skybox);
	}

	public reset() {
		this.resetSettings();
		this.resetEnvironment();
		this.resetLights();
		this.resetSkybox();
		this.resetShadows();
		this.resetMaterials();
		this.resetFloor();
		this.resetGridsLabels();
		this.resetScenes();
	}

	public handleSettingsUpdate(): void {
		this.reset();
		this.labelsScene.traverseVisible((child) => {
			if (child instanceof Mesh) child.scale.setScalar(1);
		});
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		this.labelsScene.traverseVisible((child) => {
			if (child instanceof Mesh) child.scale.setScalar(progress);
		});
	}
}
