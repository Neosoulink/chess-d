import { InstancedMesh } from "three";

import { PieceModel } from "./piece.model";

export class PiecesGroupModel extends InstancedMesh {
	public pieces: PieceModel[] = [];

	constructor(...props: ConstructorParameters<typeof InstancedMesh>) {
		super(...props);
	}
}
