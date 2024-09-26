import { inject, singleton } from "tsyringe";
import { Vector3 } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";
import { copyProperties } from "@quick-threejs/utils";

import { PiecesComponent } from "./pieces.component";
import { PiecesController } from "./pieces.controller";
import { ColorVariant } from "../../shared";
import { EngineController } from "../engine/engine.controller";

@singleton()
export class PiecesModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(PiecesController)
		private readonly controller: PiecesController,
		@inject(EngineController)
		private readonly engineController: EngineController
	) {
		this.engineController.pieceSelected$?.subscribe(() => {});

		this.controller.pieceMoved$?.subscribe((payload) => {
			const { intersection, piece } = payload;

			piece.setPosition({
				...copyProperties(
					intersection?.point instanceof Vector3
						? intersection.point
						: piece.userData.lastPosition,
					["x", "z"]
				),
				y: 0.8
			});
		});

		this.engineController.pieceMoved$?.subscribe((payload) => {
			const { piece, cell, intersection, nextMoveIndex, nextMove } = payload;

			if (!intersection || !cell || !(nextMoveIndex >= 0) || !nextMove) {
				piece.setPosition({
					...copyProperties(piece.userData.initialPosition, ["x", "z"]),
					y: 0.8
				});

				return;
			}

			this.controller.setPieceCoord(
				piece.type,
				piece.color,
				piece.id,
				cell.coord
			);
		});
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
