import { Matrix4 } from "three";
import { BoardCoord, ColorSide } from "@chess-d/shared";

import { QUATERNION, SCALE, VECTOR } from "../../constants";

/** @description Board square or cell representation */
export class MatrixCellModel extends Matrix4 {
	public readonly position = VECTOR.clone();
	public readonly rotation = QUATERNION.clone().set(0, 0, 0, 1);
	public readonly scalar = SCALE.clone().set(1, 1, 1);

	constructor(
		public readonly coord: BoardCoord = { col: 0, row: 0 },
		public readonly index: number = 0,
		public side = ColorSide.white
	) {
		super();
	}

	public computeTransforms() {
		this.decompose(this.position, this.rotation, this.scalar);
	}
}
