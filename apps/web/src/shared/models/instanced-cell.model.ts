import { InstancedMesh, PlaneGeometry } from "three";

import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_MATRIX_SIZE,
	COLOR_BLACK,
	COLOR_WHITE
} from "../constants";
import { CellModel } from "./cell.model";
import { BoardCoord } from "../interfaces";
import { ColorVariant } from "../enums";

export class InstancedCell extends InstancedMesh {
	public readonly cells: CellModel[][] = [];

	constructor() {
		super(
			new PlaneGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE, 6, 6),
			undefined,
			BOARD_MATRIX_SIZE
		);

		this.name = InstancedCell.name;
	}

	public getSquareByCoord(coord: BoardCoord): CellModel | undefined {
		return this.cells[coord.row]?.[coord.col];
	}

	public getCellByIndex(index: number): CellModel | undefined {
		const row = Math.floor(index / BOARD_MATRIX_RANGE_SIZE);
		const col = index % BOARD_MATRIX_RANGE_SIZE;

		return this.getSquareByCoord({ row, col });
	}

	public copy(pieceGroup: InstancedCell, recursive?: boolean): this {
		Object.keys(this.cells).forEach((id) => {
			pieceGroup.cells[id] = this.cells[id];
		});

		return super.copy(pieceGroup, recursive);
	}

	public dispose(): this {
		this.removeEventListener("dispose", this.dispose.bind(this));

		Object.keys(this.cells).forEach((id) => this.cells[id].dispose());

		return super.dispose();
	}

	setSquareColor(index: number, colorVariant: ColorVariant): void {
		const cell = this.getCellByIndex(index);
		if (!cell) return;

		const color =
			colorVariant === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE;

		cell.color = colorVariant;

		return this.setColorAt(index, color);
	}
}
