import { ColorVariant, PieceType } from "../enums";
import { PiecesGroupModel } from "../models";

export interface PiecesGroups {
	black: {
		pawns: PiecesGroupModel<PieceType.pawn, ColorVariant.black>;
		rocks: PiecesGroupModel<PieceType.rock, ColorVariant.black>;
		bishops: PiecesGroupModel<PieceType.bishop, ColorVariant.black>;
		knights: PiecesGroupModel<PieceType.knight, ColorVariant.black>;
		queens: PiecesGroupModel<PieceType.queen, ColorVariant.black>;
		kings: PiecesGroupModel<PieceType.king, ColorVariant.black>;
	};
	white: {
		pawns: PiecesGroupModel<PieceType.pawn, ColorVariant.white>;
		rocks: PiecesGroupModel<PieceType.rock, ColorVariant.white>;
		bishops: PiecesGroupModel<PieceType.bishop, ColorVariant.white>;
		knights: PiecesGroupModel<PieceType.knight, ColorVariant.white>;
		queens: PiecesGroupModel<PieceType.queen, ColorVariant.white>;
		kings: PiecesGroupModel<PieceType.king, ColorVariant.white>;
	};
}
