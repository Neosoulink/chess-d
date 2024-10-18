import { Color, Move } from "chess.js";

/** @description Ai representation */
export abstract class AiModel {
	public abstract getMove(color: Color): Move | undefined | null;
}
