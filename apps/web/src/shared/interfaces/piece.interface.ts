import { InstancedMesh, Intersection } from "three";
import { PieceModel, PiecesGroupModel } from "../models";

export type PieceId = number;

export interface PieceUpdatePayload<T extends InstancedMesh = InstancedMesh> {
	intersection?: Intersection<T>;
	pieceGroup: PiecesGroupModel;
	piece: PieceModel;
}
