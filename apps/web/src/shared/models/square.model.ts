import { Matrix4 } from "three";

import { BoardCoord } from "../interfaces";
import { ColorVariant } from "../enums";

/** @description Board square or board cell */
export class SquareModel extends Matrix4 {
	constructor(
		public readonly coord: BoardCoord = { col: 0, row: 0 },
		public color = ColorVariant.white
	) {
		super();
	}
}
