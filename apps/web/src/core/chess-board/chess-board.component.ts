import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import { Color, InstancedMesh, PlaneGeometry } from "three";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

import { BoardCell } from "../../common";
import { CoreComponent } from "../core.component";

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

	public physicsBody?: PhysicsProperties;

	constructor(
		@inject(CoreComponent) private readonly coreComponent: CoreComponent
	) {}

	public init() {
		this.board.userData = {
			...this.board.userData,
			useBoundingBox: true
		};

		this.physicsBody = this.coreComponent.physics?.addToWorld(
			this.board
		) as PhysicsProperties;
	}
}
