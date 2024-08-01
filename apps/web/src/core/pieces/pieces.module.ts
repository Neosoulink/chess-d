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
				this.component.pawns.b?.pieces[0]?.setCoords(
					this.chessBoardComponent.board,
					{
						...this.component.pawns.b?.pieces[0].coords,
						col: data?.value ?? 0
					}
				);

			if (data?.type === "pawnPositionRow")
				this.component.pawns.b?.pieces[0]?.setCoords(
					this.chessBoardComponent.board,
					{
						...this.component.pawns.b?.pieces[0].coords,
						row: data?.value ?? 0
					}
				);
		});
	}

	init() {
		this.component.initPawns(true);
		this.component.initPawns();

		this.component.initRocks(true);
		this.component.initRocks();

		this.component.initBishops(true);
		this.component.initBishops();

		this.component.initKnights(true);
		this.component.initKnights();

		this.component.initQueens(true);
		this.component.initQueens();

		this.component.initKings(true);
		this.component.initKings();

		if (this.component.pawns.b)
			this.appModule.world.scene().add(this.component.pawns.b);
		if (this.component.pawns.w)
			this.appModule.world.scene().add(this.component.pawns.w);

		if (this.component.rocks.b)
			this.appModule.world.scene().add(this.component.rocks.b);
		if (this.component.rocks.w)
			this.appModule.world.scene().add(this.component.rocks.w);

		if (this.component.bishops.b)
			this.appModule.world.scene().add(this.component.bishops.b);
		if (this.component.bishops.w)
			this.appModule.world.scene().add(this.component.bishops.w);

		if (this.component.knights.b)
			this.appModule.world.scene().add(this.component.knights.b);
		if (this.component.knights.w)
			this.appModule.world.scene().add(this.component.knights.w);

		if (this.component.queens.b)
			this.appModule.world.scene().add(this.component.queens.b);
		if (this.component.queens.w)
			this.appModule.world.scene().add(this.component.queens.w);

		if (this.component.kings.b)
			this.appModule.world.scene().add(this.component.kings.b);
		if (this.component.kings.w)
			this.appModule.world.scene().add(this.component.kings.w);
	}

	dispose() {}
}
