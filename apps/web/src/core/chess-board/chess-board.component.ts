import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import {
	DynamicDrawUsage,
	Euler,
	Color,
	InstancedMesh,
	PlaneGeometry
} from "three";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";
import { Physics } from "@chess-d/rapier-physics";

import {
	BoardCoords,
	BoardCell,
	MATRIX,
	QUATERNION,
	SCALE,
	VECTOR
} from "../../common";
@singleton()
export class ChessBoardComponent {
	public readonly cellSize = 1;
	public readonly cellsRangeCount = 8;
	public readonly totalCellsCount = this.cellsRangeCount ** 2;
	public readonly halfSize =
		this.cellsRangeCount * this.cellSize * 0.5 + this.cellSize * 0.5;
	public readonly cells: BoardCell[][] = [];
	public readonly cellGeometry = new PlaneGeometry(
		this.cellSize,
		this.cellSize,
		6,
		6
	);
	public readonly board = new InstancedMesh(
		this.cellGeometry,
		undefined,
		this.totalCellsCount
	);
	public readonly whiteAccent = new Color(0xffffff);
	public readonly blackAccent = this.whiteAccent
		.clone()
		.setHex(this.whiteAccent.getHex() * Math.random());

	public physics!: PhysicsProperties;

	constructor(@inject(Physics) private readonly _physics: Physics) {}

	public initCells() {
		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);
		let isBlack = false;

		this.board.position.set(this.halfSize, 0, -this.halfSize);
		this.board.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.board.count; i++) {
			const coords: BoardCoords = {
				col: Math.floor(i % this.cellsRangeCount) + 1,
				row: Math.floor(i / this.cellsRangeCount) + 1
			};

			if (!this.cells[coords.row - 1]) {
				isBlack = !isBlack;
				this.cells.push([]);
			}

			this.board.getMatrixAt(i, MATRIX);

			VECTOR.set(-(coords.col * this.cellSize), 0, coords.row * this.cellSize);
			MATRIX.compose(VECTOR, _QUATERNION, SCALE);

			this.board.setMatrixAt(i, MATRIX);
			this.board.setColorAt(i, isBlack ? this.blackAccent : this.whiteAccent);
			this.cells[coords.row - 1]?.push({
				col: coords.col,
				row: coords.row,
				isBlack
			});
			isBlack = !isBlack;
		}
	}

	public initPhysics() {
		this.board.name = ChessBoardComponent.name;

		this.board.userData = {
			...this.board.userData,
			useBoundingBox: true
		};

		this.physics = this._physics?.addToWorld(this.board) as PhysicsProperties;

		this.physics.rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
	}
}
