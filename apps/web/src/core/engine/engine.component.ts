import "reflect-metadata";

import { Chess } from "chess.js";
import { singleton } from "tsyringe";

import { PGN_MOVE_TEXT_NUMBER_KEYS, type BoardCoords } from "../../shared";

@singleton()
export class EngineComponent {
	public readonly game = new Chess();

	constructor() {}

	/** @description convert the {@link BoardCoords} to a valid PGN [MoveText](https://en.wikipedia.org/wiki/Portable_Game_Notation) */
	public coordsToPgnMoveText(coords: BoardCoords): string {
		const { col, row } = coords;
		return `${PGN_MOVE_TEXT_NUMBER_KEYS[col]}${row + 1}`;
	}
}
