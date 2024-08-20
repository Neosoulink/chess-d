import { InstancedMesh, Matrix4 } from "three";
import { Subject } from "rxjs";

import type { BoardCoords, PieceId } from "../interfaces";
import { ColorVariant, PieceType } from "../enums";
import { MATRIX, QUATERNION, SCALE, VECTOR } from "../constants";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

export class PieceModel<
	T extends PieceType = PieceType,
	C extends ColorVariant = ColorVariant
> extends Matrix4 {
	private _index: number = 0;

	public readonly update$$ = new Subject<typeof this>();
	public readonly coords: BoardCoords = { col: 0, row: 0 };

	constructor(
		public readonly id: PieceId,
		public readonly type: T,
		public readonly color: C,
		public readonly physics: PhysicsProperties,
		public readonly promotedFromType?: PieceType
	) {
		super();
	}

	public get index() {
		return this._index;
	}

	public set index(value: number) {
		this._index = Number(value);
	}

	public setCoords(board: InstancedMesh, coords: BoardCoords, yOffset = 0) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		board.getMatrixAt(coords.col + coords.row * board.count ** 0.5, MATRIX);
		MATRIX.decompose(VECTOR, QUATERNION, SCALE);
		VECTOR.setY(VECTOR.y + yOffset);

		this.physics.rigidBody.setTranslation(VECTOR, true);
		this.update$$.next(this);
	}
}
