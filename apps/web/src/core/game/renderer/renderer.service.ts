import { AppModule } from "@quick-threejs/reactive/worker";
import {
	ColorManagement,
	LinearToneMapping,
	PCFShadowMap,
	SRGBColorSpace
} from "three";
import { clamp } from "three/src/math/MathUtils.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { SettingsService } from "../settings/settings.service";

@scoped(Lifecycle.ContainerScoped)
export class RendererService {
	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsService) private readonly _settings: SettingsService
	) {}

	public resetQuality(): void {
		const renderer = this._app.renderer.instance();
		if (!renderer) return;

		const graphicsQuality =
			this._settings.state["visual-theme"]?.params["graphics-quality"]?.value;
		const pixelRatio =
			graphicsQuality === "low" ? 0.6 : graphicsQuality === "high" ? 2 : 1.25;

		renderer.setPixelRatio(pixelRatio);
	}

	public resetColors() {
		const renderer = this._app.renderer.instance();
		if (!renderer) return;

		const lightsMultiplayer = clamp(
			this._settings.state["lights-shadows"]?.params["lights-intensity"]
				?.value !== undefined
				? Number(
						this._settings.state["lights-shadows"]?.params["lights-intensity"]
							?.value ?? 100
					) / 100
				: 1,
			0.1,
			1
		);

		ColorManagement.enabled = true;
		renderer.autoClear = true;
		renderer.setClearAlpha(0);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = LinearToneMapping;
		renderer.toneMappingExposure = lightsMultiplayer;
	}

	public resetShadows(): void {
		const renderer = this._app.renderer.instance();

		if (!renderer)
			return console.error("🚧 Unable to reset shadows: renderer not found.");

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.autoUpdate = true;
		renderer.shadowMap.needsUpdate = true;
		renderer.shadowMap.type = PCFShadowMap;
	}

	public reset() {
		this.resetQuality();
		this.resetColors();
		this.resetShadows();
	}

	public init(): void {}

	public update(): void {}

	public dispose(): void {}
}
