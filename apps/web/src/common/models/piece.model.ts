import { InstancedMesh, Matrix4 } from "three";

import type { BoardCoords } from "../interfaces";
import { MATRIX } from "../constants";
import { PiecesGroupModel } from "./pieces-group.model";

export class PieceModel extends Matrix4 {
	public readonly coords: BoardCoords = { col: 0, row: 0 };

	constructor(
		public readonly parent: PiecesGroupModel,
		public readonly index: number,
		public readonly type: string,
		public readonly isBlack = false
	) {
		super();
	}

	public setCoords(board: InstancedMesh, coords: BoardCoords) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		board.getMatrixAt(coords.col + coords.row * board.count ** 0.5, MATRIX);

		this.copy(MATRIX);
		this.parent.setMatrixAt(this.index, this);
		this.parent.matrixWorldNeedsUpdate = true;
		this.parent.instanceMatrix.needsUpdate = true;
		this.parent.computeBoundingBox();
	}
}
