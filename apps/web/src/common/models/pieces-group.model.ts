import { BufferGeometry, DynamicDrawUsage, InstancedMesh } from "three";

import { ColorVariant, PieceType } from "../enums";
import { PieceModel } from "./piece.model";
import {
	COLOR_BLACK,
	COLOR_WHITE,
	QUATERNION,
	SCALE,
	VECTOR
} from "../constants";

export class PiecesGroupModel<
	type extends PieceType,
	color extends ColorVariant
> extends InstancedMesh {
	public pieces: PieceModel<type, color>[] = [];

	constructor(
		public readonly piecesType: type,
		public readonly piecesColor: color,
		count: number,
		geometry: BufferGeometry
	) {
		super(geometry, undefined, count);

		this.instanceMatrix.setUsage(DynamicDrawUsage);

		this.pieces = Array.from(Array(this.count)).map((_, i) => {
			const piece = new PieceModel(this, i, this.piecesType, this.piecesColor);
			piece.compose(VECTOR, QUATERNION, SCALE);

			this.setMatrixAt(piece.index, piece);
			this.setColorAt(
				piece.index,
				piece.color === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE
			);

			return piece;
		});

		this.update();
	}

	update() {
		this.matrixWorldNeedsUpdate = true;
		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingBox();
	}
}
