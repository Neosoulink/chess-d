import "reflect-metadata";

import { singleton } from "tsyringe";
import { BoxGeometry, BufferGeometry } from "three";

import { PieceType } from "../../common";

@singleton()
export class ResourceComponent {
	constructor() {}

	public getGeometryByPieceType(type: PieceType) {
		if (type === PieceType.pawn) return new BoxGeometry(0.2, 0.2, 1);
		if (type === PieceType.rock) return new BoxGeometry(0.5, 0.5, 1);
		if (type === PieceType.bishop) return new BoxGeometry(0.3, 0.3, 1);
		if (type === PieceType.knight) return new BoxGeometry(0.35, 0.35, 1);
		if (type === PieceType.queen) return new BoxGeometry(0.25, 0.25, 1.2);
		if (type === PieceType.king) return new BoxGeometry(0.2, 0.2, 1.5);

		return new BufferGeometry();
	}
}
