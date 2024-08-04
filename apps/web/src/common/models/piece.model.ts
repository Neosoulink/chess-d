import { InstancedMesh, Matrix4 } from "three";

import type { BoardCoords } from "../interfaces";
import { ColorVariant, PieceType } from "../enums";
import { MATRIX } from "../constants";
import { PiecesGroupModel } from "./pieces-group.model";

export class PieceModel<
	T extends PieceType,
	color extends ColorVariant
> extends Matrix4 {
	public readonly coords: BoardCoords = { col: 0, row: 0 };

	constructor(
		public readonly parent: PiecesGroupModel<T, color>,
		public readonly index: number,
		public readonly type: T,
		public readonly color: color,
		public readonly promotedFromType?: PieceType
	) {
		super();
	}

	public setCoords(board: InstancedMesh, coords: BoardCoords) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		board.getMatrixAt(coords.col + coords.row * board.count ** 0.5, MATRIX);

		this.copyPosition(MATRIX);

		this.parent.setMatrixAt(this.index, this);
		this.parent.update();
	}
}
