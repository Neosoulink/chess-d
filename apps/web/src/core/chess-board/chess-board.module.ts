import { inject, singleton } from "tsyringe";
import { DynamicDrawUsage } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ChessBoardComponent } from "./chess-board.component";
import { ChessBoardController } from "./chess-board.controller";
import { BoardCoords, MATRIX, QUATERNION, SCALE, VECTOR } from "../../common";

@singleton()
export class ChessBoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ChessBoardComponent)
		private readonly component: ChessBoardComponent,
		@inject(ChessBoardController)
		private readonly controller: ChessBoardController
	) {}

	public init() {
		let isBlack = false;
		this.component.board.position.set(
			this.component.halfSize,
			0,
			-this.component.halfSize
		);
		this.component.board.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.component.board.count; i++) {
			const coords: BoardCoords = {
				col: Math.floor(i % this.component.cellsRangeCount) + 1,
				row: Math.floor(i / this.component.cellsRangeCount) + 1
			};

			if (!this.component.cells[coords.row - 1]) {
				isBlack = !isBlack;
				this.component.cells.push([]);
			}

			this.component.board.getMatrixAt(i, MATRIX);

			VECTOR.set(
				-(coords.col * this.component.cellSize),
				0,
				coords.row * this.component.cellSize
			);
			MATRIX.compose(VECTOR, QUATERNION, SCALE);

			this.component.board.setMatrixAt(i, MATRIX);
			this.component.board.setColorAt(
				i,
				isBlack ? this.component.blackAccent : this.component.whiteAccent
			);
			this.component.cells[coords.row - 1]?.push({
				col: coords.col,
				row: coords.row,
				isBlack
			});
			isBlack = !isBlack;

			this.appModule.world.scene().add(this.component.board);
		}
	}

	public dispose() {}
}
