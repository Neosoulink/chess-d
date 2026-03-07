import {
	CircleGeometry,
	Color,
	DynamicDrawUsage,
	Euler,
	InstancedMesh,
	MeshBasicMaterial
} from "three";
import { BOARD_CELL_SIZE, BoardCoord } from "@chess-d/shared";

import { MATRIX, QUATERNION, SCALE, VECTOR } from "../../constants";

export class InstancedCellMakerModel extends InstancedMesh {
	constructor(
		private readonly parentGroup: InstancedMesh,
		public cellsCoords: BoardCoord[] = [],
		public geometry: InstancedMesh["geometry"] = new CircleGeometry(
			BOARD_CELL_SIZE / 2,
			20
		),
		public material: InstancedMesh["material"] = new MeshBasicMaterial({
			transparent: true,
			opacity: 0.45
		}),
		public accentColor: Color = new Color()
	) {
		super(geometry, material, cellsCoords.length);

		this.name = InstancedCellMakerModel.name;

		this.instanceMatrix.setUsage(DynamicDrawUsage);
		this._placeMarkers(this, cellsCoords);
		this.renderOrder = 4;
	}

	private _placeMarkers(
		object: InstancedCellMakerModel,
		cellsCoords: BoardCoord[]
	): void {
		if (!Array.isArray(cellsCoords)) return;

		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);

		cellsCoords.forEach((coord, i) => {
			object.parentGroup.getMatrixAt(
				coord.col + coord.row * object.parentGroup.count ** 0.5,
				MATRIX
			);

			MATRIX.decompose(VECTOR, QUATERNION, SCALE);
			VECTOR.add(object.parentGroup.position);
			VECTOR.setY(VECTOR.y + 0.07);

			object.getMatrixAt(i, MATRIX);

			MATRIX.compose(VECTOR, _QUATERNION, SCALE);
			object.setMatrixAt(i, MATRIX);
			object.setColorAt(i, object.accentColor);
		});

		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingSphere();
	}

	public setAccentColor(color: Color): InstancedCellMakerModel {
		this.accentColor = color;
		this.cellsCoords.forEach((_, i) => {
			this.setColorAt(i, color);
		});

		this.instanceMatrix.needsUpdate = true;
		this.computeBoundingSphere();

		return this;
	}

	public set(cellsCoords: BoardCoord[]): InstancedCellMakerModel {
		const newGroup = new InstancedCellMakerModel(
			this.parentGroup,
			cellsCoords,
			this.geometry,
			this.material,
			this.accentColor
		);
		const parent = this.parent;

		this.removeFromParent();
		this.dispose();

		this._placeMarkers(newGroup, cellsCoords);
		parent?.add(newGroup);

		return newGroup;
	}
}
