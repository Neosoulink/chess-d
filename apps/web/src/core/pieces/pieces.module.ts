import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { PiecesComponent } from "./pieces.component";
import { CoreComponent } from "../core.component";
import { CoreController } from "../core.controller";
import { ChessBoardComponent } from "../chess-board/chess-board.component";
import { PiecesController } from "./pieces.controller";
import { ColorVariant, PieceType } from "../../common";

@singleton()
export class PiecesModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(CoreComponent) private readonly coreComponent: CoreComponent,
		@inject(ChessBoardComponent)
		private readonly chessBoardComponent: ChessBoardComponent,
		@inject(CoreController)
		private readonly coreController: CoreController,
		@inject(PiecesController)
		private readonly controller: PiecesController
	) {
		this.coreController.gui$$.subscribe((data) => {
			if (data?.type === "pawnPositionCol")
				this.controller.movePiece(PieceType.pawn, ColorVariant.black, 1, {
					row: 0,
					...this.component.groups?.[ColorVariant.black]?.PAWN.pieces[1]
						?.coords,
					col: data?.value ?? 0
				});

			if (data?.type === "pawnPositionRow")
				this.controller.movePiece(PieceType.pawn, ColorVariant.black, 1, {
					col: 0,
					...this.component.groups?.[ColorVariant.black]?.PAWN.pieces[1]
						?.coords,
					row: data?.value ?? 0
				});
		});

		setTimeout(() => {
			console.log(
				"Piece Dropped ===>",
				this.controller.dropPiece(PieceType.pawn, ColorVariant.black, 0)
			);
		}, 3000);
	}

	init() {
		this.component.initPieces();

		if (this.component.groups)
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

	dispose() {}
}
