import { PieceSymbol, Square, validateFen } from "chess.js";

import {
	CHESS_SQUARE_KEY_NUMBERS,
	CHESS_SQUARE_NUMBER_KEYS
} from "../constants";
import { ColorSide } from "../enums";
import { BoardCoord } from "../interfaces";

/**
 * @description convert the {@link BoardCoord} to a valid engine {@link Square}.
 *
 * @see [PGN MoveText](https://en.wikipedia.org/wiki/Portable_Game_Notation)
 */
export const coordToSquare = ({ col, row }: BoardCoord): Square => {
	return `${CHESS_SQUARE_NUMBER_KEYS[col]}${row + 1}` as Square;
};

/** @description convert the engine {@link Square} to a valid {@link BoardCoord}. */
export const squareToCoord = (square: Square): BoardCoord => {
	if (typeof square !== "string" || !square[0] || !square[1])
		throw new Error("Invalid square type");

	return {
		col: CHESS_SQUARE_KEY_NUMBERS[square[0]],
		row: parseInt(square[1]) - 1
	};
};

/**
 * @description Get the square color from the square key (p, P, r, R ...).
 *
 * @param piece Piece square
 */
export const getPieceSymbolColor = (
	piece: PieceSymbol | Capitalize<PieceSymbol>
) => {
	if (piece === piece.toLowerCase()) return ColorSide.black;

	return ColorSide.white;
};

/**
 * @description convert FEN string to position object.
 * Returns `undefined` if the FEN string is invalid.
 *
 * @param fen FEN string.
 *
 * @inspiration_from Chris Oakman <chris@oakmac.com>
 */
export const fenToCoords = (rawFen: string) => {
	if (!validateFen(rawFen)) return undefined;

	// cut off any move, castling, etc info from the end
	// we're only interested in position information
	const fen = rawFen.replace(/ .+$/, "");
	const rows = fen.split("/");
	const positions: Record<
		ColorSide,
		Partial<Record<PieceSymbol | Capitalize<PieceSymbol>, BoardCoord[]>>
	> = {
		[ColorSide.white]: {},
		[ColorSide.black]: {}
	};

	let currentRow = 8;
	for (let i = 0; i < 8; i++) {
		const row =
			(rows[i]?.split("") as (PieceSymbol | Capitalize<PieceSymbol>)[]) ?? [];
		let colIdx = 0;

		// loop through each character in the FEN section
		for (let j = 0; j < row.length; j++) {
			const piece = row[j];

			// number / empty squares
			if (piece && piece.search(/[1-8]/) !== -1) {
				const numEmptySquares = parseInt(piece, 10);
				colIdx = colIdx + numEmptySquares;
			} else if (piece) {
				const color = getPieceSymbolColor(piece);

				if (!color) return undefined;

				if (!positions[color][piece]) positions[color][piece] = [];

				positions[color][piece].push(
					squareToCoord(
						`${CHESS_SQUARE_NUMBER_KEYS[colIdx]}${currentRow}` as Square
					)
				);
				colIdx = colIdx + 1;
			}
		}

		currentRow = currentRow - 1;
	}

	return positions;
};
