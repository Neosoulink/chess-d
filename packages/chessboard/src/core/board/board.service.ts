import { inject, singleton } from "tsyringe";
import { DynamicDrawUsage, Euler } from "three";
import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	BoardCoord,
	ColorSide
} from "@chess-d/shared";
import { PhysicsProperties } from "@chess-d/rapier/dist/types";
import { Physics } from "@chess-d/rapier";

import {
	InstancedCellModel,
	CellsMakerGroupModel,
	MATRIX,
	QUATERNION,
	SCALE,
	VECTOR,
	MatrixCellModel
} from "../../shared";

@singleton()
export class BoardService {
	public readonly instancedCell = new InstancedCellModel();
	public markersGroup = new CellsMakerGroupModel(this.instancedCell);
	public physics!: PhysicsProperties;

	constructor(@inject(Physics) private readonly _physics: Physics) {}

	public initCells() {
		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);
		let isBlack = false;

		this.instancedCell.position.set(
			BOARD_RANGE_CELLS_HALF_SIZE,
			0,
			-BOARD_RANGE_CELLS_HALF_SIZE
		);
		this.instancedCell.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.instancedCell.count; i++) {
			const coord: BoardCoord = {
				col: Math.floor(i % BOARD_MATRIX_RANGE_SIZE) + 1,
				row: Math.floor(i / BOARD_MATRIX_RANGE_SIZE) + 1
			};

			if (!this.instancedCell.cells[coord.row - 1]) {
				isBlack = !isBlack;
				this.instancedCell.cells.push([]);
			}

			this.instancedCell.getMatrixAt(i, MATRIX);

			VECTOR.set(
				-(coord.col * BOARD_CELL_SIZE),
				0,
				coord.row * BOARD_CELL_SIZE
			);
			MATRIX.compose(VECTOR, _QUATERNION, SCALE);

			this.instancedCell.setMatrixAt(i, MATRIX);
			this.instancedCell.cells[coord.row - 1]?.push(
				new MatrixCellModel({
					row: coord.row - 1,
					col: coord.col - 1
				})
			);
			this.instancedCell.setSquareColor(
				i,
				isBlack ? ColorSide.black : ColorSide.white
			);

			isBlack = !isBlack;
		}
	}

	public initPhysics() {
		this.instancedCell.name = BoardService.name;

		this.instancedCell.userData = {
			...this.instancedCell.userData,
			useBoundingBox: true
		};

		this.physics = this._physics?.addToWorld(
			this.instancedCell
		) as PhysicsProperties;

		this.physics.rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
	}

	public setMarkers(coord: BoardCoord[]) {
		const newGroup = this.markersGroup.set(coord);
		this.markersGroup = newGroup;
	}
}
