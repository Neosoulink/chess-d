import { inject, singleton } from "tsyringe";
import { DynamicDrawUsage } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ChessBoardComponent } from "./chess-board.component";
import { ChessBoardController } from "./chess-board.controller";
import { MATRIX, QUATERNION, SCALE, VECTOR } from "../../common";

@singleton()
export class ChessBoardModule implements Module {
	constructor(
		@inject(ChessBoardComponent)
		private readonly component: ChessBoardComponent,
		@inject(ChessBoardController)
		private readonly controller: ChessBoardController
	) {}

	public init(app: AppModule) {
		let isBlack = true;
		this.component.board.position.set(
			-this.component.midSize,
			0,
			-this.component.midSize
		);
		this.component.board.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.component.board.count; i++) {
			const row = Math.floor(i / this.component.size) + 1;
			const col = Math.floor(i % this.component.size) + 1;

			if (!this.component.boardMatrixes[row - 1]) {
				isBlack = !isBlack;
				this.component.boardMatrixes.push([]);
			}

			this.component.board.getMatrixAt(i, MATRIX);

			VECTOR.set(
				col * this.component.cellSize,
				0,
				row * this.component.cellSize
			);
			MATRIX.compose(VECTOR, QUATERNION, SCALE);

			this.component.board.setMatrixAt(i, MATRIX);
			this.component.board.setColorAt(
				i,
				isBlack ? this.component.blackAccent : this.component.whiteAccent
			);
			this.component.boardMatrixes[row - 1]?.push({
				col,
				row,
				isBlack
			});
			isBlack = !isBlack;

			app.world.scene().add(this.component.board);
		}
	}

	public dispose() {}
}
