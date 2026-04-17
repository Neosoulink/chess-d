import { ChessboardModule } from "@chess-d/chessboard";
import { Module } from "@quick-threejs/reactive";
import { AppModule } from "@quick-threejs/reactive/worker";
import { Subscription } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { CameraModule } from "./camera/camera.module";
import { DebugModule } from "./debug/debug.module";
import { EngineModule } from "./engine/engine.module";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { RendererModule } from "./renderer/renderer.module";
import { SettingsModule } from "./settings/settings.module";
import { WorldModule } from "./world/world.module";

@scoped(Lifecycle.ContainerScoped)
export class GameModule implements Module {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(GameController) private readonly _controller: GameController,
		@inject(GameService) private readonly _service: GameService,
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(SettingsModule) private readonly _settings: SettingsModule,
		@inject(EngineModule) public readonly engine: EngineModule,
		@inject(CameraModule) public readonly camera: CameraModule,
		@inject(RendererModule) public readonly renderer: RendererModule,
		@inject(WorldModule) public readonly world: WorldModule,
		@inject(DebugModule) public readonly debug: DebugModule
	) {
		this._subscriptions.push(
			this._app
				.pointermove$?.()
				.subscribe(this._service.updateCursorPosition.bind(this._service)),
			this._app.timer.step$().subscribe(({ delta }) => {
				this._chessboard.update({
					cursor: this._service.cursor,
					timestep: delta
				});
			}),
			this._controller.reset$.subscribe(this._service.reset.bind(this))
		);
	}

	public init(): void {
		this._settings.init();
		this.engine.init();
		this.camera.init();
		this.renderer.init();
		this.world.init();
		this.debug.init();
	}

	public dispose(): void {
		this._settings.dispose();
		this.camera.dispose();
		this.renderer.dispose();
		this.engine.dispose();
		this.world.dispose();
		this.debug.dispose();

		this._subscriptions.forEach((subscription) => subscription?.unsubscribe());
		this._subscriptions = [];
	}
}
