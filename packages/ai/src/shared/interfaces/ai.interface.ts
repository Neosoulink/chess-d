import { Move } from "chess.js";

/** @description Expected AI move result */
export type AiMoveResult =
	| Move
	| undefined
	| null
	| Promise<Move | undefined | null>;
