import { InstancedMesh, Matrix4 } from "three";

import type { BoardCoords, PieceId } from "../interfaces";
import { ColorVariant, PieceType } from "../enums";
import { MATRIX } from "../constants";
import { Subject } from "rxjs";

export class PieceModel<
	T extends PieceType = PieceType,
	color extends ColorVariant = ColorVariant
> extends Matrix4 {
	private _index: number = 0;

	public readonly update$$ = new Subject<typeof this>();
	public readonly coords: BoardCoords = { col: 0, row: 0 };

	constructor(
		public readonly id: PieceId,
		public readonly type: T,
		public readonly color: color,
		public readonly promotedFromType?: PieceType
	) {
		super();
	}

	public get index() {
		return this._index;
	}

	public set index(value: number) {
		this._index = Number(value);
	}

	public setCoords(board: InstancedMesh, coords: BoardCoords) {
		this.coords.col = coords.col;
		this.coords.row = coords.row;

		board.getMatrixAt(coords.col + coords.row * board.count ** 0.5, MATRIX);

		this.copyPosition(MATRIX);
		this.update$$.next(this);
	}
}
