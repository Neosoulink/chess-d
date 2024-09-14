import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { PiecesComponent } from "./pieces.component";
import { PiecesController } from "./pieces.controller";
import { ColorVariant } from "../../shared";

@singleton()
export class PiecesModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(PiecesComponent) private readonly component: PiecesComponent,
		@inject(PiecesController)
		private readonly controller: PiecesController
	) {
		this.controller.pieceSelected$?.subscribe((props) => {
			if (!props || !props.intersection) return;

			const { intersection, piece } = props;

			piece.setPosition({ ...intersection.point, y: 0.8 });
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
