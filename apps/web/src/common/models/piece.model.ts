import { InstancedMesh, Matrix4, Vector3, Vector3Like } from "three";
import { Subject } from "rxjs";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

import type { BoardCoords, PieceId } from "../interfaces";
import { ColorVariant, PieceType } from "../enums";
import { MATRIX, QUATERNION, SCALE, VECTOR } from "../constants";

export class PieceModel<
	T extends PieceType = PieceType,
	C extends ColorVariant = ColorVariant
> extends Matrix4 {
	private _index: number = 0;

	public readonly update$$ = new Subject<typeof this>();
	public readonly coords: BoardCoords = { col: 0, row: 0 };

	public physics!: PhysicsProperties;

	constructor(
		public readonly id: PieceId,
		public readonly type: T,
		public readonly color: C,
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

	public setCoords(
		board: InstancedMesh,
		coords: BoardCoords,
		offset: Vector3Like = new Vector3()
	) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		board.getMatrixAt(coords.col + coords.row * board.count ** 0.5, MATRIX);
		MATRIX.decompose(VECTOR, QUATERNION, SCALE);
		VECTOR.add(offset);

		this.physics.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
		this.physics.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		this.physics.rigidBody.setTranslation(VECTOR.add(board.position), true);
		this.update$$.next(this);
	}
}
