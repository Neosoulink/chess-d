import { AppModule } from "@quick-threejs/reactive/worker";
import { Scene, WebGLRenderer } from "three";

import { OrbitControls } from "three/examples/jsm/Addons.js";
import { inject, singleton } from "tsyringe";

import { DEBUG_OPTIONS } from "../../../shared/constants";
import { WorldService } from "../world/world.service";

@singleton()
export class DebugService {
	public readonly scene: Scene;
	public readonly renderer: WebGLRenderer;

	public enabled: boolean;

	constructor(
		@inject(AppModule) public readonly app: AppModule,
		@inject(WorldService) public readonly worldService: WorldService
	) {
		this.enabled = this.app.debug.enabled();
		this.renderer = this.app.renderer.instance()!;
		this.scene = this.app.world.scene();
	}

	public reset(): void {
		this.worldService.reset();
		this.resetControls();
	}

	public resetControls(): void {
		const appDebug = this.app.debug;
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
		const [folderTitle, bladeTitle] = props.type.split("~");

		if (
			(this.enabled && folderTitle && bladeTitle) ||
			(folderTitle === "Global" && bladeTitle === "Enable Debug")
		)
			DEBUG_OPTIONS[folderTitle]?.[bladeTitle]?.func({
				...props,
				self: this
			});
	}
}
