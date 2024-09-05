import { PGN_MOVE_TEXT_NUMBER_KEYS } from "../constants";
import { BoardCoords } from "../interfaces";

/** @description convert the {@link BoardCoords} to a valid [PGN MoveText](https://en.wikipedia.org/wiki/Portable_Game_Notation) */
export const coordsToPgnMoveText = (coords: BoardCoords): string => {
	const { col, row } = coords;
	return `${PGN_MOVE_TEXT_NUMBER_KEYS[col]}${row + 1}`;
};
