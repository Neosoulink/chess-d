import { ColorVariant, PieceType } from "../enums";
import { PiecesGroupModel } from "../models";

export interface PiecesGroup<color extends ColorVariant> {
	pawns: PiecesGroupModel<PieceType.pawn, color>;
	rocks: PiecesGroupModel<PieceType.rock, color>;
	bishops: PiecesGroupModel<PieceType.bishop, color>;
	knights: PiecesGroupModel<PieceType.knight, color>;
	queens: PiecesGroupModel<PieceType.queen, color>;
	kings: PiecesGroupModel<PieceType.king, color>;
}

export interface PiecesGroups {
	[ColorVariant.black]: PiecesGroup<ColorVariant.black>;
	[ColorVariant.white]: PiecesGroup<ColorVariant.white>;
}
