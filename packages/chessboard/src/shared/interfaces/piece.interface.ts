import { InstancedMesh, Intersection } from "three";
import { ColorVariant, PieceType } from "../enums";
import { MatrixPieceModel, InstancedPieceModel } from "../models";

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

export type DroppedPiecesGroup<Color extends ColorVariant> = {
	[Type in PieceType]: MatrixPieceModel<Type, Color>[] | undefined;
};

export type PiecesGroups = {
	[Color in ColorVariant]: Partial<PiecesGroup<Color>>;
};

export type DroppedPiecesGroups = {
	[Color in ColorVariant]: Partial<DroppedPiecesGroup<Color>>;
};
