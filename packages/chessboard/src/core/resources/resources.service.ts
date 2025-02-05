import { singleton } from "tsyringe";
import { BoxGeometry, BufferGeometry } from "three";
import { PieceType } from "@chess-d/shared";

@singleton()
export class ResourcesService {
	private readonly pieceGeometries: Record<PieceType, BufferGeometry> = {
		p: new BoxGeometry(0.2, 1, 0.2),
		r: new BoxGeometry(0.5, 1, 0.5),
		b: new BoxGeometry(0.3, 1, 0.3),
		n: new BoxGeometry(0.35, 1, 0.35),
		q: new BoxGeometry(0.25, 1.2, 0.25),
		k: new BoxGeometry(0.2, 1.5, 0.2)
	};

	constructor() {}

	public getPieceGeometry(type: PieceType) {
		return this.pieceGeometries[type];
	}

	public setPieceGeometry(type: PieceType, geometry: BufferGeometry) {
		this.pieceGeometries[type] = geometry;
	}
}
