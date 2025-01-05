import { singleton } from "tsyringe";
import { BoxGeometry, BufferGeometry, Mesh } from "three";
import { PieceType } from "@chess-d/shared";

@singleton()
export class ResourceComponent {
	private readonly pieceGeometries: Record<PieceType, BufferGeometry> = {
		p: new BoxGeometry(0.2, 1, 0.2),
		r: new BoxGeometry(0.5, 1, 0.5),
		b: new BoxGeometry(0.3, 1, 0.3),
		n: new BoxGeometry(0.35, 1, 0.35),
		q: new BoxGeometry(0.25, 1.2, 0.25),
		k: new BoxGeometry(0.2, 1.5, 0.2)
	};

	constructor() {}

	public getGeometryByType(type: PieceType) {
		return this.pieceGeometries[type];
	}

	public setGeometryByType(type: PieceType, geometry: BufferGeometry) {
		this.pieceGeometries[type] = geometry;
	}
}
