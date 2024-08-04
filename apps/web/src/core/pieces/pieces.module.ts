import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesComponent } from "./pieces.component";
import { CoreController } from "../core.controller";
import { PiecesController } from "./pieces.controller";
import { ColorVariant } from "../../common";

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
				this.controller.movePiece(ColorVariant.black, "pawns", 1, {
					row: 0,
					...this.component.groups?.[ColorVariant.black]?.pawns.pieces[1]
						?.coords,
					col: data?.value ?? 0
				});

			if (data?.type === "pawnPositionRow")
				this.controller.movePiece(ColorVariant.black, "pawns", 1, {
					col: 0,
					...this.component.groups?.[ColorVariant.black]?.pawns.pieces[1]
						?.coords,
					row: data?.value ?? 0
				});
		});

		setTimeout(() => {
			console.log(
				"Piece Dropped ===>",
				this.controller.dropPiece(ColorVariant.black, "pawns", 0)
			);
		}, 3000);
	}

	init() {
		this.component.initPieces();

		if (this.component.groups) {
			[...Object.keys(this.component.groups[ColorVariant.black])].forEach(
				(key) => {
					const blackGroup =
						this.component.groups?.[ColorVariant.black][
							key as unknown as keyof (typeof this.component.groups)[ColorVariant.black]
						];
					const whiteGroup =
						this.component.groups?.[ColorVariant.white][
							key as unknown as keyof (typeof this.component.groups)[ColorVariant.white]
						];

					if (blackGroup) this.appModule.world.scene().add(blackGroup);
					if (whiteGroup) this.appModule.world.scene().add(whiteGroup);
				}
			);
		}
	}

	dispose() {}
}
