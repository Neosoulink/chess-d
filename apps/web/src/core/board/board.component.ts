import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import {
	DynamicDrawUsage,
	Euler,
	Color,
	InstancedMesh,
	PlaneGeometry
} from "three";
import { PhysicsProperties } from "@chess-d/rapier-physics/dist/types";
import { Physics } from "@chess-d/rapier-physics";

import {
	BoardCoords,
	BoardCell,
	CellsMakerGroupModel,
	MATRIX,
	QUATERNION,
	SCALE,
	VECTOR,
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_MATRIX_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE
} from "../../shared";

@singleton()
export class BoardComponent {
	public readonly cells: BoardCell[][] = [];
	public readonly mesh = new InstancedMesh(
		new PlaneGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE, 6, 6),
		undefined,
		BOARD_MATRIX_SIZE
	);
	public readonly whiteAccent = new Color(0xffffff);
	public readonly blackAccent = this.whiteAccent
		.clone()
		.setHex(this.whiteAccent.getHex() * Math.random());

	public markersGroup = new CellsMakerGroupModel(this.mesh);
	public physics!: PhysicsProperties;

	constructor(@inject(Physics) private readonly _physics: Physics) {}

	public initCells() {
		const _QUATERNION = QUATERNION.clone().setFromEuler(
			new Euler(Math.PI / -2, 0, Math.PI / -2)
		);
		let isBlack = false;

		this.mesh.position.set(
			BOARD_RANGE_CELLS_HALF_SIZE,
			0,
			-BOARD_RANGE_CELLS_HALF_SIZE
		);
		this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);

		for (let i = 0; i < this.mesh.count; i++) {
			const coords: BoardCoords = {
				col: Math.floor(i % BOARD_MATRIX_RANGE_SIZE) + 1,
				row: Math.floor(i / BOARD_MATRIX_RANGE_SIZE) + 1
			};

			if (!this.cells[coords.row - 1]) {
				isBlack = !isBlack;
				this.cells.push([]);
			}

			this.mesh.getMatrixAt(i, MATRIX);

			VECTOR.set(
				-(coords.col * BOARD_CELL_SIZE),
				0,
				coords.row * BOARD_CELL_SIZE
			);
			MATRIX.compose(VECTOR, _QUATERNION, SCALE);

			this.mesh.setMatrixAt(i, MATRIX);
			this.mesh.setColorAt(i, isBlack ? this.blackAccent : this.whiteAccent);
			this.cells[coords.row - 1]?.push({
				col: coords.col,
				row: coords.row,
				isBlack
			});
			isBlack = !isBlack;
		}
	}

	public initPhysics() {
		this.mesh.name = BoardComponent.name;

		this.mesh.userData = {
			...this.mesh.userData,
			useBoundingBox: true
		};

		this.physics = this._physics?.addToWorld(this.mesh) as PhysicsProperties;

		this.physics.rigidBody.setTranslation({ x: 0, y: 0, z: 0 }, true);
	}

	public setMarkers(coords: BoardCoords[]) {
		const newGroup = this.markersGroup.set(coords);
		this.markersGroup = newGroup;
	}
}
