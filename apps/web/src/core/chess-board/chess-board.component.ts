import "reflect-metadata";

import { singleton } from "tsyringe";
import { Color, InstancedMesh, PlaneGeometry } from "three";

import { BoardMatrix } from "../../common/models/chess-board.model";

@singleton()
export class ChessBoardComponent {
	public readonly cellSize = 1;
	public readonly size = 8;
	public readonly midSize =
		this.size * this.cellSize * 0.5 + this.cellSize * 0.5;
	public readonly boardMatrixes: BoardMatrix[][] = [];
	public readonly cellGeometry = new PlaneGeometry(
		this.cellSize,
		this.cellSize,
		6,
		6
	);
	public readonly board = new InstancedMesh(
		this.cellGeometry,
		undefined,
		this.size ** 2
	);
	public readonly whiteAccent = new Color(0xffffff);
	public readonly blackAccent = this.whiteAccent
		.clone()
		.setHex(this.whiteAccent.getHex() * Math.random());

	constructor() {}
}
