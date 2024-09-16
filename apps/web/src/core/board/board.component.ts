import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import { DynamicDrawUsage, Euler } from "three";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";
import { Physics } from "@chess-d/rapier-physics";

import {
	BoardCoord,
	InstancedSquare,
	CellsMakerGroupModel,
	MATRIX,
	QUATERNION,
	SCALE,
	VECTOR,
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	ColorVariant,
	SquareModel
} from "../../shared";

@singleton()
export class BoardComponent {
	public readonly instancedSquare = new InstancedSquare();
	public markersGroup = new CellsMakerGroupModel(this.instancedSquare);
	public physics!: PhysicsProperties;

	constructor(@inject(Physics) private readonly _physics: Physics) {}

	public initCells() {
		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);
		let isBlack = false;

		this.instancedSquare.position.set(
			BOARD_RANGE_CELLS_HALF_SIZE,
			0,
			-BOARD_RANGE_CELLS_HALF_SIZE
		);
		this.instancedSquare.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.instancedSquare.count; i++) {
			const coord: BoardCoord = {
				col: Math.floor(i % BOARD_MATRIX_RANGE_SIZE) + 1,
				row: Math.floor(i / BOARD_MATRIX_RANGE_SIZE) + 1
			};

			if (!this.instancedSquare.squares[coord.row - 1]) {
				isBlack = !isBlack;
				this.instancedSquare.squares.push([]);
			}

			this.instancedSquare.getMatrixAt(i, MATRIX);

			VECTOR.set(
				-(coord.col * BOARD_CELL_SIZE),
				0,
				coord.row * BOARD_CELL_SIZE
			);
			MATRIX.compose(VECTOR, _QUATERNION, SCALE);

			this.instancedSquare.setMatrixAt(i, MATRIX);
			this.instancedSquare.squares[coord.row - 1]?.push(
				new SquareModel({
					row: coord.row - 1,
					col: coord.col - 1
				})
			);
			this.instancedSquare.setSquareColor(
				i,
				isBlack ? ColorVariant.black : ColorVariant.white
			);

			isBlack = !isBlack;
		}
	}

	public initPhysics() {
		this.instancedSquare.name = BoardComponent.name;

		this.instancedSquare.userData = {
			...this.instancedSquare.userData,
			useBoundingBox: true
		};

		this.physics = this._physics?.addToWorld(
			this.instancedSquare
		) as PhysicsProperties;

		this.physics.rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
	}

	public setMarkers(coord: BoardCoord[]) {
		const newGroup = this.markersGroup.set(coord);
		this.markersGroup = newGroup;
	}
}
