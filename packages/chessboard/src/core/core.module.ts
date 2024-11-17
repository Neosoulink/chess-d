import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";
import { Physics } from "@chess-d/rapier-physics";

import { CoreComponent } from "./core.component";
import { ResourceModule } from "./resource/resource.module";
import { WorldModule } from "./world/world.module";
import { BoardModule } from "./board/board.module";
import { PiecesModule } from "./pieces/pieces.module";
import { DebugModule } from "./debug/debug.module";

@singleton()
export class CoreModule implements Module {
	constructor(
		@inject(AppModule) private readonly app: AppModule,
		@inject(Physics) public readonly physics: Physics,
		@inject(CoreComponent) public readonly component: CoreComponent,
		@inject(ResourceModule) public readonly resource: ResourceModule,
		@inject(WorldModule) public readonly world: WorldModule,
		@inject(BoardModule) public readonly board: BoardModule,
		@inject(PiecesModule) public readonly pieces: PiecesModule,
		@inject(DebugModule) public readonly debug: DebugModule
	) {
		this.init();
	}

	public init() {
		this.app.camera.instance()?.position.set(0, 5, 5);
		this.app.camera.miniCamera()?.position.set(6, 2, 0);

		this.app.debug.cameraControls().enableRotate = false;
		this.app.debug.cameraControls().enableZoom = false;
		this.app.debug.miniCameraControls().enableRotate = false;
		this.app.debug.miniCameraControls().enableZoom = false;

		this.resource.init();
		this.world.init();
		this.board.init();
		this.pieces.init();
		this.debug.init();

		this.app.timer.step$().subscribe(() => {
			const camera = this.app.camera.instance();
			this.physics.step();

			if (camera)
				this.component.raycaster.setFromCamera(this.component.cursor, camera);
		});

		this.app.mousemove$?.().subscribe(
			(
				message: MouseEvent & {
					width: number;
					height: number;
				}
			) => {
				this.component.cursor.set(
					(message.clientX / message.width) * 2 - 1,
					-(message.clientY / message.height) * 2 + 1
				);
			}
		);
	}

	public dispose() {
		this.resource.dispose();
		this.world.dispose();
		this.board.dispose();
		this.pieces.dispose();
		this.app.dispose();
		this.debug.dispose();
	}
}
