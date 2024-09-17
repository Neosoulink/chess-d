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
		@inject(CoreComponent) private readonly component: CoreComponent,
		@inject(CoreController) private readonly controller: CoreController,
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ResourceModule)
		private readonly resourceModule: ResourceModule,
		@inject(WorldModule) private readonly worldModule: WorldModule,
		@inject(EngineModule) private readonly EngineModule: EngineModule,
		@inject(BoardModule)
		private readonly BoardModule: BoardModule,
		@inject(PiecesModule)
		private readonly piecesModule: PiecesModule,
		@inject(DebugModule) private readonly debugModule: DebugModule,
		@inject(Physics) private readonly physics: Physics
	) {
		this.appModule.camera.instance()?.position.set(0, 5, 5);
		this.appModule.camera.miniCamera()?.position.set(6, 2, 0);

		this.init();

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

		(this.appModule.debug.cameraControls() as OrbitControls).enableRotate =
			false;
		(this.appModule.debug.cameraControls() as OrbitControls).enableZoom = false;
		(this.appModule.debug.miniCameraControls() as OrbitControls).enableRotate =
			false;
		(this.appModule.debug.miniCameraControls() as OrbitControls).enableZoom =
			false;

		self.onmessage = (e: MessageEvent) => {
			if ((e.data?.type as string)?.startsWith("gui_"))
				controller.gui$$.next(e.data);
		};
	}

	public init() {
		this.resourceModule.init();
		this.worldModule.init();
		this.EngineModule.init();
		this.BoardModule.init();
		this.piecesModule.init();
		this.debugModule.init();
	}

	public dispose() {
		this.resourceModule.dispose();
		this.worldModule.dispose();
		this.EngineModule.dispose();
		this.BoardModule.dispose();
		this.piecesModule.dispose();
		this.appModule.dispose();
		this.debugModule.dispose();
	}
}
