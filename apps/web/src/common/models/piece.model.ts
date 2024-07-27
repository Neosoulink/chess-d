import { InstancedMesh, Matrix4 } from "three";

import type { BoardPosition } from "../interfaces";
import { MATRIX } from "../constants";

export class PieceModel extends Matrix4 {
	constructor(
		public readonly boardGroup: InstancedMesh,
		public readonly parentGroup: InstancedMesh,
		public readonly index: number,
		public readonly position: BoardPosition
	) {
		super();
	}

	public setPositionOnBoard(position: BoardPosition) {
		this.position.col = position.col;
		this.position.row = position.row;

		this.boardGroup.getMatrixAt(position.col + position.row * 8, MATRIX);
		this.copy(MATRIX);

		this.parentGroup.setMatrixAt(this.index, this);
		this.parentGroup.matrixWorldNeedsUpdate = true;
		this.parentGroup.instanceMatrix.needsUpdate = true;
		this.parentGroup.computeBoundingBox();
	}
}
