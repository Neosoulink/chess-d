import { inject, singleton } from "tsyringe";
import { Vector3 } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";
import { copyProperties } from "@quick-threejs/utils";

import { PiecesComponent } from "./pieces.component";
import { PiecesController } from "./pieces.controller";
import { ColorVariant, VECTOR } from "../../shared";
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
	) {}

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

		this.controller.pieceMoved$?.subscribe((payload) => {
			const { intersection, piece } = payload;

			piece.setPosition({
				...copyProperties(
					intersection?.point instanceof Vector3
						? intersection.point
						: (piece.userData.lastPosition ?? VECTOR),
					["x", "z"]
				),
				y: 0.8
			});
		});
	}

	dispose() {}
}
