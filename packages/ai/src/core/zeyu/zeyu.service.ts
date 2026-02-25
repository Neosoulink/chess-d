import { inject, singleton } from "tsyringe";
import { Chess, Color, Move, PieceSymbol } from "chess.js";

import { PieceSquareTable, PieceSquareTables } from "../../shared";

@singleton()
export class ZeyuService {
	/** @description Contain the pieces weights */
	PIECES_WEIGHTS: Record<PieceSymbol, number> = {
		p: 100,
		n: 280,
		b: 320,
		r: 479,
		q: 929,
		k: 60000
	};

	/** @description White piece square tables */
	PST_W: PieceSquareTables = {
		p: [
			[100, 100, 100, 100, 105, 100, 100, 100],
			[78, 83, 86, 73, 102, 82, 85, 90],
			[7, 29, 21, 44, 40, 31, 44, 7],
			[-17, 16, -2, 15, 14, 0, 15, -13],
			[-26, 3, 10, 9, 6, 1, 0, -23],
			[-22, 9, 5, -11, -10, -2, 3, -19],
			[-31, 8, -7, -37, -36, -14, 3, -31],
			[0, 0, 0, 0, 0, 0, 0, 0]
		],
		n: [
			[-66, -53, -75, -75, -10, -55, -58, -70],
			[-3, -6, 100, -36, 4, 62, -4, -14],
			[10, 67, 1, 74, 73, 27, 62, -2],
			[24, 24, 45, 37, 33, 41, 25, 17],
			[-1, 5, 31, 21, 22, 35, 2, 0],
			[-18, 10, 13, 22, 18, 15, 11, -14],
			[-23, -15, 2, 0, 2, 0, -23, -20],
			[-74, -23, -26, -24, -19, -35, -22, -69]
		],
		b: [
			[-59, -78, -82, -76, -23, -107, -37, -50],
			[-11, 20, 35, -42, -39, 31, 2, -22],
			[-9, 39, -32, 41, 52, -10, 28, -14],
			[25, 17, 20, 34, 26, 25, 15, 10],
			[13, 10, 17, 23, 17, 16, 0, 7],
			[14, 25, 24, 15, 8, 25, 20, 15],
			[19, 20, 11, 6, 7, 6, 20, 16],
			[-7, 2, -15, -12, -14, -15, -10, -10]
		],
		r: [
			[35, 29, 33, 4, 37, 33, 56, 50],
			[55, 29, 56, 67, 55, 62, 34, 60],
			[19, 35, 28, 33, 45, 27, 25, 15],
			[0, 5, 16, 13, 18, -4, -9, -6],
			[-28, -35, -16, -21, -13, -29, -46, -30],
			[-42, -28, -42, -25, -25, -35, -26, -46],
			[-53, -38, -31, -26, -29, -43, -44, -53],
			[-30, -24, -18, 5, -2, -18, -31, -32]
		],
		q: [
			[6, 1, -8, -104, 69, 24, 88, 26],
			[14, 32, 60, -10, 20, 76, 57, 24],
			[-2, 43, 32, 60, 72, 63, 43, 2],
			[1, -16, 22, 17, 25, 20, -13, -6],
			[-14, -15, -2, -5, -1, -10, -20, -22],
			[-30, -6, -13, -11, -16, -11, -16, -27],
			[-36, -18, 0, -19, -15, -15, -21, -38],
			[-39, -30, -31, -13, -31, -36, -34, -42]
		],
		k: [
			[4, 54, 47, -99, -99, 60, 83, -62],
			[-32, 10, 55, 56, 56, 55, 10, 3],
			[-62, 12, -57, 44, -67, 28, 37, -31],
			[-55, 50, 11, -4, -19, 13, 0, -49],
			[-55, -43, -52, -28, -51, -47, -8, -50],
			[-47, -42, -43, -79, -64, -32, -29, -32],
			[-4, 3, -14, -50, -57, -18, 13, 4],
			[17, 30, -3, -14, 6, -1, 40, 18]
		]
	};

	/** @description */
	PST_B = {
		p: this.PST_W["p"].slice().reverse(),
		n: this.PST_W["n"].slice().reverse(),
		b: this.PST_W["b"].slice().reverse(),
		r: this.PST_W["r"].slice().reverse(),
		q: this.PST_W["q"].slice().reverse(),
		k: this.PST_W["k"].slice().reverse()
	} as unknown as Record<PieceSymbol, PieceSquareTables>;

	/** @description */
	PST_KE_W: PieceSquareTable = [
		[-50, -40, -30, -20, -20, -30, -40, -50],
		[-30, -20, -10, 0, 0, -10, -20, -30],
		[-30, -10, 20, 30, 30, 20, -10, -30],
		[-30, -10, 30, 40, 40, 30, -10, -30],
		[-30, -10, 30, 40, 40, 30, -10, -30],
		[-30, -10, 20, 30, 30, 20, -10, -30],
		[-30, -30, 0, 0, 0, 0, -30, -30],
		[-50, -30, -30, -30, -30, -30, -30, -50]
	];

	/** @description */
	PST_KE_B = this.PST_KE_W.slice().reverse() as PieceSquareTable;

	/** @description */
	PST_OPPONENT = { w: this.PST_B, b: this.PST_W };

	/** @description */
	PST_SELF = { w: this.PST_W, b: this.PST_B };

	/** @description */
	PST_KE_OPPONENT = { w: this.PST_KE_B, b: this.PST_KE_W };

	/** @description */
	PST_KE_SELF = { w: this.PST_KE_W, b: this.PST_KE_B };

	private positionCount = 0;

	constructor(@inject(Chess) private readonly game: Chess) {}

	/**
	 * @description
	 *
	 * Evaluates the board at this point in time,
	 * using the material weights and piece square tables.
	 */
	evaluateBoard = (move: Move, prevSum: number, color: Color) => {
		if (this.game.isCheckmate()) {
			// Opponent is in checkmate (good for us)
			if (move.color === color) return 10 ** 10;

			// Our king's in checkmate (bad for us)
			return -(10 ** 10);
		}

		if (
			this.game.isDraw() ||
			this.game.isThreefoldRepetition() ||
			this.game.isStalemate()
		)
			return 0;

		if (this.game.isCheck()) {
			// Opponent is in check (good for us)
			if (move.color === color) prevSum += 50;
			// Our king's in check (bad for us)
			else prevSum -= 50;
		}

		const from = [
			8 - parseInt(move.from[1] as string),
			move.from.charCodeAt(0) - "a".charCodeAt(0)
		] as const;
		const to = [
			8 - parseInt(move.to[1] as string),
			move.to.charCodeAt(0) - "a".charCodeAt(0)
		] as const;

		let isKingEndgame = false;

		// Change endgame behavior for kings
		if (prevSum < -1500 && move.piece === "k") isKingEndgame = true;

		if (move.captured) {
			const weight = this.PIECES_WEIGHTS[move.captured];
			const pstOpponent = isKingEndgame
				? this.PST_KE_OPPONENT[move.color]
				: this.PST_OPPONENT[move.color][move.captured];
			const pstSelf = this.PST_SELF[move.color][move.captured];

			// Opponent piece was captured (good for us)
			if (move.color === color)
				prevSum += weight + (pstOpponent[to[0]]?.[to[1]] ?? 0);
			// Our piece was captured (bad for us)
			else prevSum -= weight + (pstSelf[to[0]]?.[to[1]] ?? 0);
		}

		const selfWeight = this.PIECES_WEIGHTS[move.piece];
		const pstSelf = isKingEndgame
			? this.PST_KE_SELF[move.color]
			: this.PST_SELF[move.color][move.piece];

		if (move.promotion) {
			const promotionWeight = this.PIECES_WEIGHTS[move.promotion];
			const pstPromotion = isKingEndgame
				? this.PST_KE_SELF[move.color]
				: this.PST_SELF[move.color][move.promotion];

			// Our piece was promoted (good for us)
			if (move.color === color) {
				prevSum -= selfWeight + (pstSelf[from[0]]?.[from[1]] ?? 0);
				prevSum += promotionWeight + (pstPromotion[to[0]]?.[to[1]] ?? 0);
			}
			// Opponent piece was promoted (bad for us)
			else {
				prevSum +=
					this.PIECES_WEIGHTS[move.piece] + (pstSelf[from[0]]?.[from[1]] ?? 0);
				prevSum -=
					this.PIECES_WEIGHTS[move.promotion] +
					(pstPromotion[to[0]]?.[to[1]] ?? 0);
			}
		} else {
			// The moved piece still exists on the updated board, so we only need to update the position value
			if (move.color !== color) {
				prevSum += pstSelf[from[0]]?.[from[1]] ?? 0;
				prevSum -= pstSelf[to[0]]?.[to[1]] ?? 0;
			} else {
				prevSum -= pstSelf[from[0]]?.[from[1]] ?? 0;
				prevSum += pstSelf[to[0]]?.[to[1]] ?? 0;
			}
		}

		return prevSum;
	};

	/**
	 * @description
	 *
	 * Performs the minimax algorithm to choose the best move: https://en.wikipedia.org/wiki/Minimax (pseudocode provided)
	 * Recursively explores all possible moves up to a given depth, and evaluates the game board at the leaves.
	 *
	 * Basic idea: maximize the minimum value of the position resulting from the opponent's possible following moves.
	 * Optimization: alpha-beta pruning: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning (pseudocode provided)
	 *
	 * @inputs
	 *  - game:                 the game object.
	 *  - depth:                the depth of the recursive tree of all possible moves (i.e. height limit).
	 *  - isMaximizingPlayer:   true if the current layer is maximizing, false otherwise.
	 *  - sum:                  the sum (evaluation) so far at the current layer.
	 *  - color:                the color of the current player.
	 *
	 * @output The best move at the root of the current subtree.
	 */
	minimax(
		depth: number,
		alpha: number,
		beta: number,
		isMaximizingPlayer: boolean,
		sum: number,
		color: Color
	): [Move | null, number] {
		this.positionCount++;
		const children = this.game.moves({ verbose: true });

		// Sort moves randomly, so the same move isn't always picked on ties
		children.sort(function (a, b) {
			return 0.5 - Math.random();
		});

		// Maximum depth exceeded or node is a terminal node (no children)
		if (depth === 0 || children.length === 0) return [null, sum];

		// Find maximum/minimum from list of 'children' (possible moves)
		let maxValue = Number.NEGATIVE_INFINITY;
		let minValue = Number.POSITIVE_INFINITY;
		let currMove: Move | undefined | null = null;
		let bestMove: Move | undefined | null = null;

		for (let i = 0; i < children.length; i++) {
			currMove = children[i];

			if (currMove) {
				// Note: in our case, the 'children' are simply modified game states
				const currPrettyMove = this.game.move(currMove);
				const newSum = this.evaluateBoard(currPrettyMove, sum, color);
				const [_childBestMove, childValue] = this.minimax(
					depth - 1,
					alpha,
					beta,
					!isMaximizingPlayer,
					newSum,
					color
				);

				this.game.undo();

				if (isMaximizingPlayer) {
					if (childValue > maxValue) {
						maxValue = childValue;
						bestMove = currPrettyMove;
					}

					if (childValue > alpha) alpha = childValue;
				} else {
					if (childValue < minValue) {
						minValue = childValue;
						bestMove = currPrettyMove;
					}

					if (childValue < beta) beta = childValue;
				}

				// Alpha-beta pruning
				if (alpha >= beta) break;
			}
		}

		if (isMaximizingPlayer) return [bestMove, maxValue];
		else return [bestMove, minValue];
	}
}
