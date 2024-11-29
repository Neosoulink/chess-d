import { InstancedMesh, Matrix4, Object3D, Vector3, Vector3Like } from "three";
import { Subject } from "rxjs";
import { PhysicsProperties } from "@chess-d/rapier-physics";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";

import { MATRIX, QUATERNION, SCALE, VECTOR } from "../../constants";

export class MatrixPieceModel<
	T extends PieceType = PieceType,
	C extends ColorSide = ColorSide
> extends Matrix4 {
	public readonly updated$$ = new Subject<typeof this>();
	public readonly coord: BoardCoord = { col: 0, row: 0 };
	public readonly position = new Vector3();
	public readonly userData: Object3D["userData"] & {
		initialPosition?: Vector3;
		lastPosition?: Vector3;
	} = {};

	public physics?: PhysicsProperties;

	constructor(
		public readonly type: T,
		public readonly color: C,
		public readonly instanceId: number,
		public promotedFromType?: PieceType
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
		this.updated$$.next(this);

		return this;
	}

	public setCoord(
		board: InstancedMesh,
		coord: BoardCoord,
		offset: Vector3Like = new Vector3()
	) {
		this.coord.col = coord.col;
		this.coord.row = coord.row;

		board.getMatrixAt(coord.col + coord.row * board.count ** 0.5, MATRIX);

		MATRIX.decompose(VECTOR, QUATERNION, SCALE);
		VECTOR.add(offset);

		this.setPosition(VECTOR);
	}
}
