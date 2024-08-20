import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import { Color, InstancedMesh, PlaneGeometry } from "three";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";
import { Physics } from "@chess-d/rapier-physics";

import { BoardCell } from "../../common";

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

	public init() {
		this.board.name = ChessBoardComponent.name;

		this.board.userData = {
			...this.board.userData,
			useBoundingBox: true
		};

		this.physics = this._physics?.addToWorld(this.board) as PhysicsProperties;
	}
}
