import { InstancedMesh, PlaneGeometry } from "three";

import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_MATRIX_SIZE,
	COLOR_BLACK,
	COLOR_WHITE
} from "../constants";
import { SquareModel } from "./square.model";
import { BoardCoord } from "../interfaces";
import { ColorVariant } from "../enums";

export class InstancedSquare extends InstancedMesh {
	public readonly squares: SquareModel[][] = [];

	constructor() {
		super(
			new PlaneGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE, 6, 6),
			undefined,
			BOARD_MATRIX_SIZE
		);

		this.name = InstancedSquare.name;
	}

	public getSquareByCoord(coord: BoardCoord): SquareModel | undefined {
		return this.squares[coord.row]?.[coord.col];
	}

	public getSquareByIndex(index: number): SquareModel | undefined {
		const row = Math.floor(index / BOARD_MATRIX_RANGE_SIZE);
		const col = index % BOARD_MATRIX_RANGE_SIZE;

		return this.getSquareByCoord({ row, col });
	}

	public copy(pieceGroup: InstancedSquare, recursive?: boolean): this {
		Object.keys(this.squares).forEach((id) => {
			pieceGroup.squares[id] = this.squares[id];
		});

		return super.copy(pieceGroup, recursive);
	}

	public dispose(): this {
		this.removeEventListener("dispose", this.dispose.bind(this));

		Object.keys(this.squares).forEach((id) => this.squares[id].dispose());

		return super.dispose();
	}

	setSquareColor(index: number, colorVariant: ColorVariant): void {
		const square = this.getSquareByIndex(index);
		if (!square) return;

		const color =
			colorVariant === ColorVariant.black ? COLOR_BLACK : COLOR_WHITE;

		square.color = colorVariant;

		return this.setColorAt(index, color);
	}
}
