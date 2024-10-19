import "reflect-metadata";

import { singleton } from "tsyringe";
import { BoxGeometry, BufferGeometry } from "three";

import { PieceType } from "../../shared";

@singleton()
export class ResourceComponent {
	constructor() {}

	public getGeometryByPieceType(type: PieceType) {
		if (type === PieceType.pawn) return new BoxGeometry(0.2, 1, 0.2);
		if (type === PieceType.rock) return new BoxGeometry(0.5, 1, 0.5);
		if (type === PieceType.bishop) return new BoxGeometry(0.3, 1, 0.3);
		if (type === PieceType.knight) return new BoxGeometry(0.35, 1, 0.35);
		if (type === PieceType.queen) return new BoxGeometry(0.25, 1.2, 0.25);
		if (type === PieceType.king) return new BoxGeometry(0.2, 1.5, 0.2);

		return new BufferGeometry();
	}
}
