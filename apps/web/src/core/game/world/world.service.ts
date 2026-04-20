import { ChessboardModule } from "@chess-d/chessboard";
import { AppModule } from "@quick-threejs/reactive/worker";
import { Group } from "three";
import { inject, Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class WorldService {
	public readonly scene = new Group();

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule
	) {
		this.scene.name = "world";
	}

	public resetScenes(): void {
		this.scene.clear();
	}

	public reset() {
		this.resetScenes();
	}

	public init() {
		const appScene = this._app.world.scene();
		appScene.add(this.scene);
	}

	public update(): void {}

	public dispose() {
		this.scene.removeFromParent();
		this.scene.clear();
	}
}
