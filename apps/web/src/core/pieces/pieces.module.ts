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
			if (data?.type === "pawnPositionCol") {
				this.component.groups?.black?.pawns.pieces[0]?.setCoords(
					this.chessBoardComponent.board,
					{
						...this.component.groups?.black?.pawns.pieces[0].coords,
						col: data?.value ?? 0
					}
				);
			}

			if (data?.type === "pawnPositionRow")
				this.component.groups?.black?.pawns.pieces[0]?.setCoords(
					this.chessBoardComponent.board,
					{
						...this.component.groups?.black?.pawns.pieces[0].coords,
						row: data?.value ?? 0
					}
				);
		});
	}

	init() {
		this.component.initPieces();

		if (this.component.groups) {
			[...Object.keys(this.component.groups.black)].forEach((key) => {
				const blackGroup =
					this.component.groups?.black[
						key as unknown as keyof typeof this.component.groups.black
					];
				const whiteGroup =
					this.component.groups?.white[
						key as unknown as keyof typeof this.component.groups.white
					];

				if (blackGroup) this.appModule.world.scene().add(blackGroup);
				if (whiteGroup) this.appModule.world.scene().add(whiteGroup);
			});
		}
	}

	dispose() {}
}
