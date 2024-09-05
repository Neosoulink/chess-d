import {
	BufferGeometry,
	CircleGeometry,
	DynamicDrawUsage,
	Euler,
	InstancedMesh,
	MeshBasicMaterial
} from "three";

import { BoardCoords } from "../interfaces";
import {
	BOARD_CELL_SIZE,
	MATRIX,
	QUATERNION,
	SCALE,
	VECTOR
} from "../constants";

export class CellsMakerGroupModel extends InstancedMesh {
	constructor(
		private readonly parentGroup: InstancedMesh,
		public cellsCoords: BoardCoords[] = [],
		geometry: BufferGeometry = new CircleGeometry(BOARD_CELL_SIZE / 2, 20)
	) {
		super(
			geometry,
			new MeshBasicMaterial({ color: 0xffff00 }),
			cellsCoords.length
		);

		this.instanceMatrix.setUsage(DynamicDrawUsage);
		this._placeMarkers(this, cellsCoords);
	}

	private _placeMarkers(
		object: CellsMakerGroupModel,
		cellsCoords: BoardCoords[]
	): void {
		if (typeof cellsCoords.length !== "number") return;

		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);

		cellsCoords.forEach((coords, i) => {
			object.parentGroup.getMatrixAt(
				coords.col + coords.row * object.parentGroup.count ** 0.5,
				MATRIX
			);

			MATRIX.decompose(VECTOR, QUATERNION, SCALE);
			VECTOR.add(object.parentGroup.position);
			VECTOR.setY(VECTOR.y + 0.08);

			object.getMatrixAt(i, MATRIX);

			MATRIX.compose(VECTOR, _QUATERNION, SCALE);
			object.setMatrixAt(i, MATRIX);
		});

		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingSphere();
	}

	public set(cellsCoords: BoardCoords[]): CellsMakerGroupModel {
		const newGroup = new CellsMakerGroupModel(
			this.parentGroup,
			cellsCoords,
			this.geometry
		);
		const parent = this.parent;

		this.removeFromParent();
		this.dispose();

		this._placeMarkers(newGroup, cellsCoords);
		parent?.add(newGroup);

		return newGroup;
	}
}
