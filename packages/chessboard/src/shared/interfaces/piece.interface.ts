import { Intersection, Vector3Like } from "three";
import { ColorVariant, PieceType } from "../enums";
import {
	MatrixPieceModel,
	InstancedPieceModel,
	InstancedCellModel,
	MatrixCellModel
} from "../models";
import { BoardCoord } from "./board.interface";

export type PieceNotificationPayload = {
	piecesIntersection?: Intersection<InstancedPieceModel>;
	cellsIntersection?: Intersection<InstancedCellModel>;
	piece: MatrixPieceModel;
	startPosition: Vector3Like;
	lastPosition?: Vector3Like;
	startSquare: string;
	endSquare?: string;
	startCoord: BoardCoord;
	endCoord?: BoardCoord;
	cell?: MatrixCellModel;
};

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
