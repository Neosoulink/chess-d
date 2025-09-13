import { AppModule } from "@quick-threejs/reactive/worker";
import {
	ColorManagement,
	Quaternion,
	QuaternionLike,
	Scene,
	ShadowMapType,
	ToneMapping,
	Vector3Like,
	WebGLRenderer
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { inject, singleton } from "tsyringe";

import { WorldService } from "../world/world.service";

@singleton()
export class DebugService {
	private readonly _scene: Scene;
	private readonly _renderer: WebGLRenderer;

	public readonly enabled: boolean;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _worldService: WorldService
	) {
		this.enabled = this._app.debug.enabled();
		this._renderer = this._app.renderer.instance()!;
		this._scene = this._app.world.scene();
	}

	public reset(): void {
		if (!this.enabled) return;

		this._worldService.reset();

		this.resetControls();
	}

	public resetControls(): void {
		const appDebug = this._app.debug;
		const orbitControls = appDebug.getCameraControls() as
			| OrbitControls
			| undefined;
		const miniOrbitControls = appDebug.getMiniCameraControls() as
			| OrbitControls
			| undefined;

		if (orbitControls) {
			orbitControls.target.set(0, 0, 0);
			orbitControls.enableRotate = true;
			orbitControls.enableZoom = true;
			orbitControls.enablePan = true;
		}

		if (miniOrbitControls) {
			miniOrbitControls.enableRotate = true;
		}
	}

	public handlePaneChange(props: { type: string; value: unknown }): void {
		// Global
		if (props.type === "global-reset") this.reset();

		// Color Management
		if (props.type === "colorManagement-enabled")
			ColorManagement.enabled = !!props.value;

		if (props.type === "colorManagement-reset")
			this._worldService.resetColorManagement();

		// Renderer
		if (this._renderer instanceof WebGLRenderer) {
			if (props.type === "renderer-autoClear")
				this._renderer.autoClear = !!props.value;
			if (props.type === "renderer-clearColor")
				this._renderer.setClearColor(`${props.value}`, 1);
			if (props.type === "renderer-toneMapping")
				this._renderer.toneMapping = props.value as ToneMapping;
			if (props.type === "renderer-toneExposure")
				this._renderer.toneMappingExposure = props.value as ToneMapping;
			if (props.type === "renderer-reset") this._worldService.resetRenderer();

			// Environment
			if (props.type === "environment-enable")
				this._scene.environment = props.value
					? this._worldService.environment.target.texture || null
					: null;
			if (props.type === "environment-intensity")
				this._scene.environmentIntensity = Number(props.value) || 0;
			if (props.type === "environment-rotation")
				this._scene.environmentRotation.setFromQuaternion(
					new Quaternion().copy(props.value as QuaternionLike)
				);
			if (props.type === "environment-skyTurbidity")
				this._worldService.environment.sky.userData.turbidity =
					Number(props.value) || 0;
			if (props.type === "environment-skyRayleigh")
				this._worldService.environment.sky.userData.rayleigh =
					Number(props.value) || 0;
			if (props.type === "environment-skyMieCoefficient")
				this._worldService.environment.sky.userData.mieCoefficient =
					Number(props.value) || 0;
			if (props.type === "environment-skyMieDirectionalG")
				this._worldService.environment.sky.userData.mieDirectionalG =
					Number(props.value) || 0;
			if (props.type === "environment-skyElevation")
				this._worldService.environment.sky.userData.elevation =
					Number(props.value) || 0;
			if (props.type === "environment-skyAzimuth")
				this._worldService.environment.sky.userData.azimuth =
					Number(props.value) || 0;
			if (props.type === "environment-reset")
				this._worldService.resetEnvironment();

			// Lights
			if (props.type === "lights-enableAmbient")
				this._worldService.lights.sunPropagation.visible = !!props.value;
			if (props.type === "lights-ambientIntensity")
				this._worldService.lights.sunPropagation.intensity =
					Number(props.value) || 0;
			if (props.type === "lights-ambientColor")
				this._worldService.lights.sunPropagation.color.set(
					props.value as string
				);

			if (props.type === "lights-enableDirectional")
				this._worldService.lights.sun.visible = !!props.value;
			if (props.type === "lights-directionalIntensity")
				this._worldService.lights.sun.intensity = Number(props.value) || 0;
			if (props.type === "lights-directionalPosition")
				this._worldService.lights.sun.position.copy({
					...(props.value as Vector3Like)
				});
			if (props.type === "lights-directionalLookAt")
				this._worldService.lights.sun.target.position.copy({
					...(props.value as Vector3Like)
				});
			if (props.type === "lights-directionalColor")
				this._worldService.lights.sun.color.set(props.value as string);

			if (props.type === "lights-reset") this._worldService.resetLights();

			if (props.type === "shadows-shadowMap")
				this._renderer.shadowMap.enabled = !!props.value;
			if (props.type === "shadows-shadowMapAutoUpdate")
				this._renderer.shadowMap.autoUpdate = !!props.value;
			if (props.type === "shadows-shadowMapNeedsUpdate")
				this._renderer.shadowMap.needsUpdate = !!props.value;
			if (props.type === "shadows-shadowMapType")
				this._renderer.shadowMap.type = props.value as ShadowMapType;
			if (props.type === "shadows-outputColorSpace")
				this._renderer.outputColorSpace = props.value as string;
			if (props.type === "shadows-cast")
				this._worldService.lights.sun.castShadow = !!props.value;
			if (props.type === "shadows-bias")
				this._worldService.lights.sun.shadow.bias = Number(props.value) || 0;
			if (props.type === "shadows-mapSize") {
				const mapSize = Number(props.value) || 0;
				this._worldService.lights.sun.shadow.mapSize.set(mapSize, mapSize);
				this._worldService.lights.sun.shadow.map?.setSize(mapSize, mapSize);
			}
			if (props.type === "shadows-near")
				this._worldService.lights.sun.shadow.camera.near =
					Number(props.value) || 0;
			if (props.type === "shadows-far")
				this._worldService.lights.sun.shadow.camera.far =
					Number(props.value) || 0;
			if (props.type === "shadows-top")
				this._worldService.lights.sun.shadow.camera.top =
					Number(props.value) || 0;
			if (props.type === "shadows-bottom")
				this._worldService.lights.sun.shadow.camera.bottom =
					Number(props.value) || 0;
			if (props.type === "shadows-left")
				this._worldService.lights.sun.shadow.camera.left =
					Number(props.value) || 0;
			if (props.type === "shadows-right")
				this._worldService.lights.sun.shadow.camera.right =
					Number(props.value) || 0;
			if (props.type === "shadows-normalBias")
				this._worldService.lights.sun.shadow.normalBias =
					Number(props.value) || 0;

			if (props.type === "shadows-reset") this._worldService.resetShadow();
		}

		console.log(props);
	}
}
