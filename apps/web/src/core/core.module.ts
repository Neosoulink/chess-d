import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { CoreController } from "./core.controller";
import { CoreComponent } from "./core.component";
import { ResourceModule } from "./resource/resource.module";
import { GameModule } from "./game/game.module";
import { WorldModule } from "./world/world.module";
import { ChessBoardModule } from "./chess-board/chess-board.module";
import { PiecesModule } from "./pieces/pieces.module";

@singleton()
export class CoreModule implements Module {
	constructor(
		@inject(CoreComponent) private readonly component: CoreComponent,
		@inject(CoreController) private readonly controller: CoreController,
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ResourceModule)
		private readonly resourceModule: ResourceModule,
		@inject(WorldModule) private readonly worldModule: WorldModule,
		@inject(GameModule) private readonly gameModule: GameModule,
		@inject(ChessBoardModule)
		private readonly chessBoardModule: ChessBoardModule,
		@inject(PiecesModule)
		private readonly piecesModule: PiecesModule
	) {
		this.appModule.camera.instance()?.position.set(0, 5, -5);
		this.appModule.camera.miniCamera()?.position.set(2, 5, -6);

		self.onmessage = (e: MessageEvent) => {
			if ((e.data?.type as string)?.startsWith("pawn"))
				controller.gui$$.next(e.data);
		};

		this.appModule.timer.step$().subscribe(() => {
			this.component.physics?.step();
		});
		this.init();
	}

	public async init() {
		await this.component.init();
		this.resourceModule.init();
		this.worldModule.init();
		this.gameModule.init();
		this.chessBoardModule.init();
		this.piecesModule.init();
	}

	public dispose() {
		this.resourceModule.dispose();
		this.worldModule.dispose();
		this.gameModule.dispose();
		this.chessBoardModule.dispose();
		this.piecesModule.dispose();
		this.appModule.dispose();
	}
}
