import { AppModule } from "@quick-threejs/reactive/worker";
import {
	Color,
	ColorManagement,
	NoToneMapping,
	PCFSoftShadowMap,
	SRGBColorSpace
} from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class RendererService {
	constructor(@inject(AppModule) private readonly _app: AppModule) {}

	public resetColors() {
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

	public resetShadows(): void {
		const renderer = this._app.renderer.instance();

		if (!renderer)
			return console.error("🚧 Unable to reset shadows: renderer not found.");

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.autoUpdate = true;
		renderer.shadowMap.needsUpdate = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
	}

	public reset() {
		this.resetColors();
		this.resetShadows();
	}

	public init(): void {}

	public update(): void {}

	public dispose(): void {}
}
