import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesComponent } from "./pieces.component";
import { CoreController } from "../core.controller";
import { PiecesController } from "./pieces.controller";

@singleton()
export class PiecesModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent,
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(CoreController)
		private readonly coreController: CoreController,
		@inject(PiecesController)
		private readonly controller: PiecesController
	) {
		this.coreController.gui$$.subscribe((data) => {
			if (data?.type === "pawnPositionCol")
				this.component.pawns.userData[0]?.setPositionOnBoard({
					...this.component.pawns.userData[0].position,
					col: data?.value ?? 0
				});

			if (data?.type === "pawnPositionRow")
				this.component.pawns.userData[0]?.setPositionOnBoard({
					...this.component.pawns.userData[0].position,
					row: data?.value ?? 0
				});
		});
	}

	init() {
		this.component.setPawns(1);

		this.appModule.world.scene().add(this.component.pawns);
	}

	dispose() {}
}
