import { ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import { PerspectiveCamera } from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

import { CameraController } from "./camera.controller";

@scoped(Lifecycle.ContainerScoped)
export class CameraService {
	constructor(@inject(AppModule) private readonly _app: AppModule) {}

	public reset() {
		const appDebug = this._app.debug;

		const camera = this._app.camera.instance() as PerspectiveCamera;
		const debugCamera = appDebug.miniCamera();

		camera.position.set(0, 12, -9);
		camera.lookAt(0, 0, 0);
		camera.fov = 40;
		camera.near = 0.1;
		camera.far = 100;

		debugCamera?.position.set(6, 2, 0);
	}

	public handleIntroAnimation(
		progress: ObservablePayload<CameraController["introAnimation$"]>
	) {
		this._app.camera.instance()?.position.copy({
			x: -20 + progress * 20,
			y: progress * 12,
			z: -9 * progress
		});

		this._app.camera.instance()?.lookAt(0, 0, 0);
	}

	public handleIdleAnimation(
		data: ObservablePayload<CameraController["idleAnimation$"]>
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

	public init(): void {}

	public update(): void {}

	public dispose(): void {}
}
