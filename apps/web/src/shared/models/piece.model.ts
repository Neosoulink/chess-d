import { InstancedMesh, Matrix4, Vector3, Vector3Like } from "three";
import { Subject } from "rxjs";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";

import { BoardCoords, PieceId } from "../interfaces";
import { ColorVariant, PieceType } from "../enums";
import { MATRIX, QUATERNION, SCALE, VECTOR } from "../constants";

export class PieceModel<
	T extends PieceType = PieceType,
	C extends ColorVariant = ColorVariant
> extends Matrix4 {
	public readonly update$$ = new Subject<typeof this>();
	public readonly coords: BoardCoords = { col: 0, row: 0 };
	public readonly position = new Vector3();

	public physics?: PhysicsProperties;

	constructor(
		public readonly id: PieceId,
		public readonly type: T,
		public readonly color: C,
		public readonly promotedFromType?: PieceType,
		public index = 0
	) {
		super();
	}

	public setPosition(x: number | Vector3Like, y?: number, z?: number): this {
		if (typeof x === "number" && typeof y === "number" && typeof z === "number")
			VECTOR.set(x, y!, z!);
		else if (
			typeof (x as Vector3Like).x === "number" &&
			typeof (x as Vector3Like).y === "number" &&
			typeof (x as Vector3Like).x === "number"
		)
			VECTOR.copy(x as Vector3Like);

		QUATERNION.set(0, 0, 0, 1);

		this.compose(VECTOR, QUATERNION, SCALE);
		super.setPosition(VECTOR);

		this.physics?.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
		this.physics?.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
		this.physics?.rigidBody.setTranslation(VECTOR, true);
		this.physics?.rigidBody.setRotation(QUATERNION, true);

		this.position.copy(VECTOR);
		this.update$$.next(this);

		return this;
	}

	public setCoords(
		mesh: InstancedMesh,
		coords: BoardCoords,
		offset: Vector3Like = new Vector3()
	) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		mesh.getMatrixAt(coords.col + coords.row * mesh.count ** 0.5, MATRIX);

		MATRIX.decompose(VECTOR, QUATERNION, SCALE);
		VECTOR.add(offset);

		this.setPosition(VECTOR);
	}
}
