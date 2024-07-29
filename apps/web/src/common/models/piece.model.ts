import { InstancedMesh, Matrix4 } from "three";

import type { BoardCoords } from "../interfaces";
import { MATRIX } from "../constants";
import { PiecesGroupModel } from "./pieces-group.model";

export class PieceModel extends Matrix4 {
	constructor(
		public readonly boardGroup: InstancedMesh,
		public readonly parentGroup: PiecesGroupModel,
		public readonly index: number,
		public readonly type: string,
		public readonly isBlack?: boolean,
		public readonly position: BoardCoords = { col: 0, row: 0 }
	) {
		super();
		this.setPositionOnBoard(this.position);
	}

	public setPositionOnBoard(position: BoardCoords) {
		this.position.col = position.col;
		this.position.row = position.row;

		this.boardGroup.getMatrixAt(
			position.col + position.row * this.boardGroup.count ** (1 / 2),
			MATRIX
		);
		this.copy(MATRIX);

		this.parentGroup.setMatrixAt(this.index, this);
		this.parentGroup.matrixWorldNeedsUpdate = true;
		this.parentGroup.instanceMatrix.needsUpdate = true;
		this.parentGroup.computeBoundingBox();
	}
}
