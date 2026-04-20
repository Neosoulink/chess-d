import { BoxGeometry, Color, InstancedMesh } from "three";
import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_MATRIX_SIZE,
	BoardCoord,
	ColorSide
} from "@chess-d/shared";

import { COLOR_BLACK, COLOR_WHITE } from "../../constants";
import { MatrixCellModel } from "../matrixes/matrix-cell.model";

export class InstancedCellModel extends InstancedMesh {
	public readonly cells: MatrixCellModel[][] = [];

	public readonly cellSideColors: Record<ColorSide, Color> = {
		[ColorSide.black]: COLOR_BLACK.clone(),
		[ColorSide.white]: COLOR_WHITE.clone()
	};

	constructor() {
		super(
			new BoxGeometry(BOARD_CELL_SIZE, BOARD_CELL_SIZE, 0.1, 6, 6),
			undefined,
			BOARD_MATRIX_SIZE
		);

		this.name = InstancedCellModel.name;
	}

	public getCellByCoord(coord: BoardCoord): MatrixCellModel | undefined {
		return this.cells[coord.row]?.[coord.col];
	}

	public getCellByIndex(index: number): MatrixCellModel | undefined {
		const row = Math.floor(index / BOARD_MATRIX_RANGE_SIZE);
		const col = index % BOARD_MATRIX_RANGE_SIZE;

		return this.getCellByCoord({ row, col });
	}

	public copy(pieceGroup: InstancedCellModel, recursive?: boolean): this {
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

	/**
	 * @experimental
	 *
	 * @todo: Make sure this matches the old logic at from `BoardService#initCells`
	 */
	public addCell(coord: BoardCoord, side: ColorSide): void {
		const row = coord.row - 1;
		const col = coord.col - 1;
		const index = row * BOARD_MATRIX_RANGE_SIZE + col;
		const newCell = new MatrixCellModel(coord, index, side);

		if (!this.cells[row]) this.cells[row] = [];

		this.cells[row]![col] = newCell;

		this.applyCellColor(index);
	}

	public applyCellColor(index: number): void {
		const cell = this.getCellByIndex(index);
		if (!cell) return;

		this.setColorAt(index, this.cellSideColors[cell.side]);
	}

	public applyCellsColors(): void {
		this.cells.forEach((cellRow) => {
			cellRow.forEach((cell) => {
				this.applyCellColor(cell.index);
			});
		});
	}

	public setCellSideColors(
		side: ColorSide,
		color: string | number | Color
	): void {
		this.cellSideColors[side].set(color);

		this.applyCellsColors();
		if (this.instanceColor) this.instanceColor.needsUpdate = true;
	}
}
