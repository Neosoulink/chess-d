import { BLACK, Color, WHITE } from "chess.js";

export enum MoveFlags {
	non_capture = "n",
	pawn_two_squares = "b",
	en_passant = "e",
	capture = "c",
	promotion = "p",
	kingside_castle = "k",
	queenside_castle = "q",
	none_capture_promotion = "np",
	capture_promotion = "cp"
}

/**
 * @description Supported colors variations (or type),
 * based on {@link Color ChessJs.Color}
 */
export enum ColorSide {
	black = BLACK,
	white = WHITE
}
