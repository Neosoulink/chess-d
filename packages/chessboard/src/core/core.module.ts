import { inject, singleton } from "tsyringe";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { AppModule, Module } from "@quick-threejs/reactive";
import { Physics } from "@chess-d/rapier-physics";

import { CoreController } from "./core.controller";
import { CoreComponent } from "./core.component";
import { ResourceModule } from "./resource/resource.module";
import { EngineModule } from "./engine/engine.module";
import { WorldModule } from "./world/world.module";
import { BoardModule } from "./board/board.module";
import { PiecesModule } from "./pieces/pieces.module";
import { DebugModule } from "./debug/debug.module";

@singleton()
export class CoreModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(Physics) public readonly physics: Physics,
		@inject(CoreComponent) public readonly component: CoreComponent,
		@inject(CoreController) public readonly controller: CoreController,
		@inject(ResourceModule)
		public readonly resourceModule: ResourceModule,
		@inject(WorldModule) public readonly worldModule: WorldModule,
		@inject(BoardModule)
		public readonly boardModule: BoardModule,
		@inject(PiecesModule)
		public readonly piecesModule: PiecesModule,
		@inject(EngineModule) public readonly engineModule: EngineModule,
		@inject(DebugModule)
		public readonly debugModule: DebugModule
	) {
		this.init();
	}

	public init() {
		this.appModule.camera.instance()?.position.set(0, 5, 5);
		this.appModule.camera.miniCamera()?.position.set(6, 2, 0);

		(this.appModule.debug.cameraControls() as OrbitControls).enableRotate =
			false;
		(this.appModule.debug.cameraControls() as OrbitControls).enableZoom = false;
		(this.appModule.debug.miniCameraControls() as OrbitControls).enableRotate =
			false;
		(this.appModule.debug.miniCameraControls() as OrbitControls).enableZoom =
			false;

		this.resourceModule.init();
		this.worldModule.init();
		this.boardModule.init();
		this.piecesModule.init();
		this.engineModule.init();
		this.debugModule.init();

		this.appModule.timer.step$().subscribe(() => {
			const camera = this.appModule.camera.instance();
			this.physics.step();

			if (camera)
				this.component.raycaster.setFromCamera(this.component.cursor, camera);
		});

		this.appModule.mousemove$?.().subscribe((e: any) => {
			const event = e as MouseEvent & {
				width: number;
				height: number;
			};
			this.component.cursor.set(
				(event.clientX / event.width) * 2 - 1,
				-(event.clientY / event.height) * 2 + 1
			);
		});
	}

	public dispose() {
		this.resourceModule.dispose();
		this.worldModule.dispose();
		this.boardModule.dispose();
		this.piecesModule.dispose();
		this.engineModule.dispose();
		this.appModule.dispose();
		this.debugModule.dispose();
	}
}
