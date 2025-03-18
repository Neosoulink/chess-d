import { Methods } from "@quick-threejs/utils";
import { Chess } from "chess.js";

export interface MoveLike {
	from: string;
	to: string;
	san: string;
	promotion?: string;
	strict?: boolean;
}

export type TransferableChessMethods = Pick<
	Methods<Chess>,
	| "ascii"
	| "fen"
	| "inCheck"
	| "isCheck"
	| "isCheckmate"
	| "isDraw"
	| "isGameOver"
	| "isInsufficientMaterial"
	| "isStalemate"
	| "isThreefoldRepetition"
	| "pgn"
	| "turn"
>;

export type TransferableChessData = {
	[key in keyof TransferableChessMethods]: ReturnType<
		TransferableChessMethods[key]
	>;
};
