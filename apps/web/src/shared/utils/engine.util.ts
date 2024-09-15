import { Square } from "chess.js";

import {
	ENGINE_SQUARE_KEY_NUMBERS,
	ENGINE_SQUARE_NUMBER_KEYS
} from "../constants";
import { BoardCoords } from "../interfaces";

/**
 * @description convert the {@link BoardCoords} to a valid engine {@link Square}.
 *
 * @see [PGN MoveText](https://en.wikipedia.org/wiki/Portable_Game_Notation)
 */
export const coordToEngineSquare = (coords: BoardCoords): Square => {
	const { col, row } = coords;
	return `${ENGINE_SQUARE_NUMBER_KEYS[col]}${row + 1}` as Square;
};

/** @description convert the engine {@link Square} to a valid {@link BoardCoords}. */
export const engineSquareToCoord = (square: Square): BoardCoords => {
	if (typeof square !== "string" || !square[0] || !square[1])
		throw new Error("Invalid square type");

	return {
		col: ENGINE_SQUARE_KEY_NUMBERS[square[0]],
		row: parseInt(square[1]) - 1
	};
};
