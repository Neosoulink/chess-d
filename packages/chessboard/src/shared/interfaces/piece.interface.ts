import { BufferGeometry, Intersection, Vector3Like } from "three";
import { BoardCoord, ColorSide, PieceType } from "@chess-d/shared";

import {
	MatrixPieceModel,
	InstancedPieceModel,
	InstancedCellModel,
	MatrixCellModel
} from "../models";

export type PieceNotificationPayload = {
	cell?: MatrixCellModel;
	cellsIntersection?: Intersection<InstancedCellModel>;
	colorSide: ColorSide;
	endCoord?: BoardCoord;
	endSquare?: string;
	instancedPiece: InstancedPieceModel<PieceType, ColorSide>;
	lastPosition?: Vector3Like;
	piece: MatrixPieceModel;
	pieceGeometry: BufferGeometry;
	piecesIntersection?: Intersection<InstancedPieceModel>;
	startCoord: BoardCoord;
	startPosition: Vector3Like;
	startSquare: string;
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
