import { InstancedMesh, Intersection } from "three";
import { ColorVariant, PieceType } from "../enums";
import { MatrixPieceModel, InstancedPieceModel } from "../models";

export type PieceId = number;

export type PieceNotificationPayload<
	T extends InstancedMesh = InstancedMesh,
	Extra extends object = object
> = {
	intersection?: Intersection<T>;
	instancedPiece: InstancedPieceModel;
	piece: MatrixPieceModel;
} & Extra;

export type PiecesGroup<Color extends ColorVariant> = {
	[Type in PieceType]: InstancedPieceModel<Type, Color>;
};

export type PiecesGroups = {
	[Color in ColorVariant]: PiecesGroup<Color>;
};
