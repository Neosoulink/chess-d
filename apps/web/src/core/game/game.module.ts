import { AppModule, Module } from "@quick-threejs/reactive";
import { Subscription } from "rxjs";
import { inject, singleton } from "tsyringe";

import { EngineModule } from "./engine/engine.module";
import { HandModule } from "./hands/hands.module";
import { PiecesModule } from "./pieces/pieces.module";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { PerspectiveCamera } from "three";
import { ChessboardModule } from "@chess-d/chessboard";

@singleton()
export class GameModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(HandModule) public readonly hands: HandModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule,
		@inject(GameController) public readonly controller: GameController,
		@inject(GameService) public readonly service: GameService
	) {
		this._subscriptions.push(
			this._app.mousemove$?.().subscribe((payload) => {
				this.service.cursor = {
					x: (payload.clientX / payload.width) * 2 - 1,
					y: -(payload.clientY / payload.height) * 2 + 1
				};
			}),
			this._app.timer.step$().subscribe(({ deltaTime }) => {
				this._chessboard.update({
					cursor: this.service.cursor,
					delta: deltaTime
				});
			}),
			this.controller.piecesWillReset$.subscribe((payload) => {
				const { fen } = payload.data.value || {};

				this.service.reset(fen);
			})
		);

		const camera = this._app.camera.instance() as PerspectiveCamera;
		camera.position.set(0, 12, -7);
		camera.fov = 45;
		camera.near = 0.1;
		camera.far = 30;
		camera.lookAt(0, 0, 0);

		const miniCamera = this._app.debug.miniCamera();
		miniCamera?.position.set(6, 2, 0);

		const orbitControls = this._app.debug.getCameraControls();

		if (orbitControls) {
			orbitControls.enableRotate = false;
			orbitControls.enableZoom = false;
			orbitControls.enablePan = false;
		}

		const miniOrbitControls = this._app.debug.getMiniCameraControls();
		if (miniOrbitControls) miniOrbitControls.enableRotate = false;
	}

	public init(): void {
		this.hands.init();
		this.pieces.init();
		this.engine.init();
	}

	public dispose(): void {
		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this.hands.dispose();
		this.pieces.dispose();
		this.engine.dispose();
	}
}
