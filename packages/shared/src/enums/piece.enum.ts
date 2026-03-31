import {
	BISHOP,
	KING,
	KNIGHT,
	PAWN,
	QUEEN,
	ROOK,
	type PieceSymbol
} from "chess.js";

/**  @description Piece type based on the {@link PieceSymbol ChessJs.PieceSymbol}. */
export enum PieceType {
	pawn = PAWN,
	bishop = BISHOP,
	knight = KNIGHT,
	rook = ROOK,
	queen = QUEEN,
	king = KING
}
