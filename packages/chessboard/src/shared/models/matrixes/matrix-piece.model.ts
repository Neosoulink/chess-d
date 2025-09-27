import { PhysicsProperties } from "@chess-d/rapier";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";
import { Subject } from "rxjs";
import {
	InstancedMesh,
	Matrix4,
	Object3D,
	Quaternion,
	Vector3,
	Vector3Like
} from "three";

import { MATRIX, QUATERNION, SCALE, VECTOR } from "../../constants";

export class MatrixPieceModel<
	T extends PieceType = PieceType,
	C extends ColorSide = ColorSide
> extends Matrix4 {
	public readonly updated$$ = new Subject<typeof this>();
	public readonly coord: BoardCoord = { col: 0, row: 0 };
	public readonly position = VECTOR.clone();
	public readonly rotation = QUATERNION.clone().set(0, 0, 0, 1);
	public readonly scalar = SCALE.clone().set(1, 1, 1);
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
		if (typeof x === "number") this.position.set(x, y || x, z || x);
		else
			this.position.copy({
				x: x.x || this.position.x,
				y: x.y || this.position.y,
				z: x.z || this.position.z
			});

		if (this.physics?.rigidBody) {
			this.rotation.copy(this.physics.rigidBody.rotation());

			this.physics.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
			this.physics.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
			this.physics.rigidBody.setTranslation(this.position, true);
		}

		try {
			setTimeout(() => {
				this.rotation.set(0, 0, 0, 1);
				this.physics?.rigidBody.setRotation(this.rotation, true);
			}, 100);
		} catch (error) {
			this.userData.lastPosition = new Vector3();
		}

		this.compose(this.position, this.rotation, this.scalar);
		this.updated$$.next(this);

		return super.setPosition(this.position);
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

		this.rotation.set(0, 0, 0, 1);
		this.physics?.rigidBody.setRotation(this.rotation, true);

		this.setPosition(VECTOR);
	}

	compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this {
		this.position.copy(position);
		this.rotation.copy(quaternion);
		this.scalar.copy(scale);

		return super.compose(position, quaternion, scale);
	}

	dispose() {
		this.physics = undefined;
		this.updated$$.complete();
	}
}
