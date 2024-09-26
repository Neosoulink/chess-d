import { InstancedMesh, Intersection } from "three";
import { PieceModel, PiecesGroupModel } from "../models";

export type PieceId = number;

export type PieceUpdatePayload<
	T extends InstancedMesh = InstancedMesh,
	Extra extends object = object
> = {
	intersection?: Intersection<T>;
	pieceGroup: PiecesGroupModel;
	piece: PieceModel;
} & Extra;
