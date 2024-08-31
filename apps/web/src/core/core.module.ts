import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { CoreController } from "./core.controller";
import { CoreComponent } from "./core.component";
import { ResourceModule } from "./resource/resource.module";
import { EngineModule } from "./engine/engine.module";
import { WorldModule } from "./world/world.module";
import { BoardModule } from "./chess-board/board.module";
import { PiecesModule } from "./pieces/pieces.module";
import { DebugModule } from "./debug/debug.module";
import { Physics } from "@chess-d/rapier-physics";

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
		this.appModule.camera.instance()?.position.set(0, 5, -5);
		this.appModule.camera.miniCamera()?.position.set(2, 5, -6);

		this.init();

		this.appModule.timer.step$().subscribe(() => {
			this.physics.step();
		});

		self.onmessage = (e: MessageEvent) => {
			if ((e.data?.type as string)?.startsWith("pawn"))
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
