import { ColorSide, ObservablePayload } from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import { PerspectiveCamera } from "three";
import { clamp } from "three/src/math/MathUtils.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { SettingsService } from "../settings/settings.service";
import { EngineService } from "../engine/engine.service";
import { CameraController } from "./camera.controller";

@scoped(Lifecycle.ContainerScoped)
export class CameraService {
	private readonly Y_POSITION_SCALE = 24;
	private readonly CAMERA_SIDE_OFFSET = 10;

	private _yPositionMultiplier = 0.5;
	private _yPosition = 12;
	private _cameraSideX = 0;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(SettingsService) private readonly _settings: SettingsService,
		@inject(EngineService) private readonly _engineService: EngineService
	) {}

	private _resolveCameraSideX(side: string, playerSide: ColorSide): number {
		if (side !== "left" && side !== "right") return 0;
		const flip = playerSide === ColorSide.white ? -1 : 1;
		return side === "left"
			? -this.CAMERA_SIDE_OFFSET * flip
			: this.CAMERA_SIDE_OFFSET * flip;
	}

	public reset() {
		const camera = this._app.camera.instance() as PerspectiveCamera;
		const playerSide = this._engineService.state.playerSide;
		const cameraFov =
			this._settings.state["camera"]?.params["fov"]?.value !== undefined
				? Number(this._settings.state["camera"]?.params["fov"]?.value)
				: 40;
		this._yPositionMultiplier = clamp(
			this._settings.state["camera"]?.params["y-position"]?.value !== undefined
				? Number(
						this._settings.state["camera"]?.params["y-position"]?.value ?? 100
					) / 100
				: 1,
			0.1,
			1
		);
		this._yPosition = this.Y_POSITION_SCALE * this._yPositionMultiplier;

		const sideRaw =
			this._settings.state["camera"]?.params["side-position"]?.value;
		this._cameraSideX = this._resolveCameraSideX(
			typeof sideRaw === "string" ? sideRaw : "default",
			playerSide
		);

		camera.position.set(
			this._cameraSideX,
			this._yPosition,
			(playerSide === ColorSide.white ? -1 : 1) * 9
		);
		camera.lookAt(0, 0, 0);
		camera.fov = cameraFov;
		camera.near = 0.1;
		camera.far = 300;
	}

	public handleIntroAnimation(
		progress: ObservablePayload<CameraController["introAnimation$"]>
	) {
		const playerSide = this._engineService.state.playerSide;
		const camera = this._app.camera.instance();

		camera?.position.copy({
			x: -20 + progress * (20 + this._cameraSideX),
			y: progress * this._yPosition,
			z: (playerSide === ColorSide.white ? -1 : 1) * 9 * progress
		});
		camera?.lookAt(0, 0, 0);
	}

	public handleIdleAnimation(
		data: ObservablePayload<CameraController["idleAnimation$"]>
	) {
		const camera = this._app.camera.instance();
		camera?.lookAt(0, 0, 0);
		camera?.position.set(
			Math.sin(data.elapsed * 0.1) * 10 + this._cameraSideX,
			this._yPosition,
			Math.cos(data.elapsed * 0.1) * 10
		);
	}
}
