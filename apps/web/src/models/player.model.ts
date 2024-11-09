import { PlayerEntity } from "@chess-d/api";
import { BoardCoord, MatrixPieceModel } from "@chess-d/chessboard";
import { InstancedMesh, Vector3Like } from "three";

export class PlayerModel extends PlayerEntity {
	public pickedPiece?: MatrixPieceModel;

	constructor(public readonly board: InstancedMesh) {
		super();
	}

	public pickPiece(piece: MatrixPieceModel): void {
		this.pickedPiece = piece;
	}

	public movePickedPiece(at: Vector3Like) {
		this.pickedPiece?.setPosition(at);
	}

	public placePickedPiece(to: BoardCoord) {
		this.pickedPiece?.setCoord(this.board, to, {
			x: 0,
			y: 1,
			z: 0
		});
	}
}
