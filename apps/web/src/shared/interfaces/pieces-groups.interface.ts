import { ColorVariant, PieceType } from "../enums";
import { PiecesGroupModel } from "../models";

export type PiecesGroup<Color extends ColorVariant> = {
	[Type in PieceType]: PiecesGroupModel<Type, Color>;
};

export type PiecesGroups = {
	[Color in ColorVariant]: PiecesGroup<Color>;
};
