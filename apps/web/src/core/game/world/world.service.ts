import { ChessboardModule } from "@chess-d/chessboard";
import { AppModule } from "@quick-threejs/reactive";
import {
	AmbientLight,
	Color,
	ColorManagement,
	CubeCamera,
	DirectionalLight,
	DoubleSide,
	Group,
	HalfFloatType,
	Material,
	MathUtils,
	Mesh,
	MeshPhysicalMaterial,
	NoToneMapping,
	Object3DEventMap,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShadowMaterial,
	SkinnedMesh,
	SRGBColorSpace,
	Vector3,
	WebGLCubeRenderTarget
} from "three";
import { inject, singleton } from "tsyringe";

import { InfiniteGridHelper } from "../../../shared/meshes/infinite-grid.mesh";
import { Sky } from "three/examples/jsm/Addons.js";
import { HandService } from "../hands/hands.service";
import { WorldController } from "./world.controller";
import { ObservablePayload } from "@chess-d/shared";

@singleton()
export class WorldService {
	public readonly scene = new Group();
	public readonly floor = new Group();
	public readonly environment: {
		scene: Scene;
		target: WebGLCubeRenderTarget;
		sky: Sky;
		camera: CubeCamera;
	};
	public readonly lights = {
		sun: new DirectionalLight("#ffffff", 0.3),
		sunPropagation: new AmbientLight("#ffffff", 0.05)
	};

	/** @description The duration of a day in seconds. */
	public dayDuration = 60;
	/** @description Whether the current time is night. */
	public isNight = false;

	public mainMaterial = new MeshPhysicalMaterial({
		side: DoubleSide,
		sheen: 2,
		roughness: 0.8,
		metalness: 0
	});

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(HandService) private readonly _handService: HandService
	) {
		// Environment
		const environmentScene = new Scene();
		const environmentTarget = new WebGLCubeRenderTarget(256, {
			type: HalfFloatType
		});
		const environmentSky = new Sky();
		const environmentCamera = new CubeCamera(0.1, 100, environmentTarget);

		this.environment = {
			scene: environmentScene,
			target: environmentTarget,
			sky: environmentSky,
			camera: environmentCamera
		};

		// Floor
		const infiniteFloor = new InfiniteGridHelper(
			1,
			1,
			new Color("#d9d9d9"),
			20
		);
		infiniteFloor.name = "infinite-floor";
		const floorShadow = new Mesh(
			new PlaneGeometry(50, 50),
			new ShadowMaterial({
				opacity: 0.2
			})
		);
		floorShadow.name = "floor-shadow";
		this.floor.add(floorShadow, infiniteFloor);
	}

	public resetColorManagement(): void {
		ColorManagement.enabled = true;
	}

	public resetRenderer(): void {
		const renderer = this._app.renderer.instance();
		if (!renderer) return;

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

		camera.position.set(0, 10, -7);
		camera.lookAt(0, 0, 0);
		camera.fov = 40;
		camera.near = 0.1;
		camera.far = 500;

		miniCamera?.position.set(6, 2, 0);
	}

	public updateEnvironmentSky(): void {
		const uniforms = this.environment.sky.material.uniforms!;
		const phi = MathUtils.degToRad(
			90 - this.environment.sky.userData.elevation
		);
		const theta = MathUtils.degToRad(this.environment.sky.userData.azimuth);

		if (uniforms["turbidity"])
			uniforms["turbidity"].value = this.environment.sky.userData.turbidity;
		if (uniforms["rayleigh"])
			uniforms["rayleigh"].value = this.environment.sky.userData.rayleigh;
		if (uniforms["mieCoefficient"])
			uniforms["mieCoefficient"].value =
				this.environment.sky.userData.mieCoefficient;
		if (uniforms["mieDirectionalG"])
			uniforms["mieDirectionalG"].value =
				this.environment.sky.userData.mieDirectionalG;

		this.environment.sky.userData.sunPosition.setFromSphericalCoords(
			1,
			phi,
			theta
		);

		if (uniforms["sunPosition"])
			uniforms["sunPosition"].value.copy(
				this.environment.sky.userData.sunPosition
			);
	}

	public resetEnvironment(): void {
		const baseScene = this._app.world.scene();
		baseScene.environment = this.environment.target.texture;
		baseScene.environmentRotation.set(0, 0, 0, "XYZ");
		baseScene.environmentIntensity = 1;

		this.environment.sky.clear();
		this.environment.sky.userData = {
			turbidity: 10,
			rayleigh: 3,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.7,
			elevation: 2,
			azimuth: 90,
			sunPosition: new Vector3()
		};
		this.environment.sky.scale.setScalar(450000);
		this.environment.scene.clear();
		this.environment.scene.add(this.environment.sky);

		this.environment.target.depth = 0;

		this.updateEnvironmentSky();
	}

	public resetLights(): void {
		this.lights.sunPropagation.visible = true;
		this.lights.sunPropagation.intensity = 0.1;

		this.lights.sun.visible = true;
		this.lights.sun.intensity = 0.5;
		this.lights.sun.position.set(0, 5, 0);
		this.lights.sun.shadow.camera.near = 0.1;
		this.lights.sun.shadow.camera.far = 60;
	}

	public resetShadow(): void {
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
		this.lights.sun.shadow.mapSize.set(4096, 4096);
		this.lights.sun.shadow.map?.setSize(4096, 4096);
		this.lights.sun.shadow.camera.far = 50;
		this.lights.sun.shadow.camera.near = 0.1;
		this.lights.sun.shadow.camera.top = 8;
		this.lights.sun.shadow.camera.bottom = -8;
		this.lights.sun.shadow.camera.left = -8;
		this.lights.sun.shadow.camera.right = 8;
	}

	public resetChessboard(): void {
		const chessboard = this._chessboard.world.getScene();
		chessboard.traverseVisible((child) => {
			child.castShadow = true;
			child.receiveShadow = true;

			if (child instanceof Mesh) child.material = this.mainMaterial;
		});
	}

	public resetFloor(): void {
		const infiniteFloor = this.floor.getObjectByName(
			"infinite-floor"
		) as InfiniteGridHelper;
		const floorShadow = this.floor.getObjectByName("floor-shadow") as Mesh<
			PlaneGeometry,
			ShadowMaterial,
			Object3DEventMap
		>;

		infiniteFloor.position.setY(-0.5);

		floorShadow.position.setY(-0.49);
		floorShadow.rotation.x = -Math.PI / 2;
		floorShadow.receiveShadow = true;
		floorShadow.material.opacity = 0.2;
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

	public resetScene(): void {
		this.scene.clear();
		this.scene.add(
			this.floor,
			this._chessboard.world.getScene(),
			...Object.values(this._handService.hands).map((side) => side.scene),
			...Object.values(this.lights)
			// this.environment.scene
		);
	}

	public reset() {
		this.resetColorManagement();
		this.resetRenderer();
		this.resetCamera();
		this.resetEnvironment();
		this.resetLights();
		this.resetShadow();
		this.resetChessboard();
		this.resetFloor();
		this.resetHands();
		this.resetScene();
	}

	public update(): void {
		this.environment.camera?.update(
			this._app.renderer.instance()!,
			this.environment.scene
		);
	}

	public handleDayCycle({
		normalizedProgress,
		progress
	}: ObservablePayload<WorldController["dayNightCycle$"]>): void {
		const isMidCycle = normalizedProgress >= 0.5;
		const sunAngle = progress * Math.PI * 2;
		const dayFactor = Math.sin(sunAngle);
		const toneAccent = Math.max(0.4, dayFactor * 0.8);
		const floorShadow = this.floor.getObjectByName("floor-shadow") as
			| Mesh<PlaneGeometry, ShadowMaterial, Object3DEventMap>
			| undefined;

		this.environment.sky.userData.elevation = normalizedProgress * 180 * 2;
		this.environment.sky.userData.azimuth =
			(Math.round(progress) % 2) * 50 + 90;
		this.updateEnvironmentSky();

		this.lights.sun.position.x =
			this.environment.sky.userData.sunPosition.x * 3 * (isMidCycle ? -1 : 1);
		this.lights.sun.position.y =
			this.environment.sky.userData.sunPosition.y * 3 * (isMidCycle ? -1 : 1);
		this.lights.sun.position.z = this.environment.sky.userData.sunPosition.z;

		this.lights.sun.color.set(
			new Color(
				isMidCycle ? toneAccent : 1,
				Math.max(0.7, dayFactor),
				isMidCycle ? 1 : toneAccent
			)
		);
		this.lights.sun.intensity = 0.7 * dayFactor * (isMidCycle ? -1 : 1);
		this.lights.sunPropagation.intensity = Math.max(0.1, 0.2 * (1 - dayFactor));

		if (floorShadow)
			floorShadow.material.opacity = 0.2 * dayFactor * (isMidCycle ? -1 : 1);

		this._app.world.scene().environmentIntensity = Math.max(0.15, -dayFactor);
	}
}
