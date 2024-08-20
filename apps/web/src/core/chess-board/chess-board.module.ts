import { inject, singleton } from "tsyringe";
import { DynamicDrawUsage, Euler } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { BoardCoords, MATRIX, QUATERNION, SCALE, VECTOR } from "../../common";
import { CoreComponent } from "../core.component";
import { ChessBoardComponent } from "./chess-board.component";
import { ChessBoardController } from "./chess-board.controller";

@singleton()
export class ChessBoardModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ChessBoardComponent)
		private readonly component: ChessBoardComponent,
		@inject(CoreComponent) private readonly coreComponent: CoreComponent,
		@inject(ChessBoardController)
		private readonly controller: ChessBoardController
	) {}

	public init() {
		this.component.init();

		this.component.board.position.set(
			this.component.halfSize,
			0,
			-this.component.halfSize
		);

		this.component.physics?.rigidBody.setTranslation(
			{ x: this.component.halfSize, y: 0, z: -this.component.halfSize },
			true
		);

		this.component.board.instanceMatrix.setUsage(DynamicDrawUsage);

		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, 0)
		);
		let isBlack = false;

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
			MATRIX.compose(VECTOR, _QUATERNION, SCALE);

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
