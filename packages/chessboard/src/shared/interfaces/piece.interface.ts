import { Intersection, Vector3Like } from "three";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";

import {
	MatrixPieceModel,
	InstancedPieceModel,
	InstancedCellModel,
	MatrixCellModel
} from "../models";

export type PieceNotificationPayload = {
	piecesIntersection?: Intersection<InstancedPieceModel>;
	cellsIntersection?: Intersection<InstancedCellModel>;
	instancedPiece: InstancedPieceModel<PieceType, ColorSide>;
	piece: MatrixPieceModel;
	startPosition: Vector3Like;
	lastPosition?: Vector3Like;
	startSquare: string;
	endSquare?: string;
	startCoord: BoardCoord;
	endCoord?: BoardCoord;
	cell?: MatrixCellModel;
};

export type PiecesGroup<Color extends ColorSide> = {
	[Type in PieceType]: InstancedPieceModel<Type, Color>;
};

export type DroppedPiecesGroup<Color extends ColorSide> = {
	[Type in PieceType]: MatrixPieceModel<Type, Color>[] | undefined;
};

export type PiecesGroups = {
	[Color in ColorSide]: Partial<PiecesGroup<Color>>;
};

export type DroppedPiecesGroups = {
	[Color in ColorSide]: Partial<DroppedPiecesGroup<Color>>;
};
