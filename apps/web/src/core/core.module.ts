import { inject, singleton } from "tsyringe";
import { Module } from "@quick-threejs/reactive";

import { CoreController } from "./core.controller";
import { CoreComponent } from "./core.component";
import { GameModule } from "./game/game.module";
import { CorePropsModel } from "../common/models/core-props.model";
import { WorldModule } from "./world/world.module";
import { ChessBoardModule } from "./chess-board/chess-board.module";

@singleton()
export class CoreModule implements Module {
	constructor(
		@inject(CorePropsModel) private readonly props: CorePropsModel,
		@inject(CoreComponent) private readonly component: CoreComponent,
		@inject(CoreController) private readonly controller: CoreController,
		@inject(WorldModule) private readonly worldModule: WorldModule,
		@inject(GameModule) private readonly gameModule: GameModule,
		@inject(ChessBoardModule)
		private readonly chessBoardModule: ChessBoardModule
	) {
		this.props.app.camera.instance()?.position.set(0, 5, 5);
		this.props.app.camera.miniCamera()?.position.set(2, 5, 6);

		self.onmessage = (e: MessageEvent) => {
			if (e.data?.type === "tile_pos") console.log(e.data.value);
		};

		this.init();
	}

	public init() {
		this.worldModule.init(this.props.app);
		this.gameModule.init(this.props.app);
		this.chessBoardModule.init(this.props.app);
	}

	public dispose() {}
}
