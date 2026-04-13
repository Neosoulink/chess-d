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
	| "attackers"
	| "board"
	| "fen"
	| "hash"
	| "header"
	| "history"
	| "inCheck"
	| "isAttacked"
	| "isCheck"
	| "isCheckmate"
	| "isDraw"
	| "isDrawByFiftyMoves"
	| "isGameOver"
	| "isInsufficientMaterial"
	| "isStalemate"
	| "isThreefoldRepetition"
	| "moveNumber"
	| "moves"
	| "perft"
	| "pgn"
	| "turn"
>;

export type TransferableChessData = {
	[key in keyof TransferableChessMethods]: ReturnType<
		TransferableChessMethods[key]
	>;
};
