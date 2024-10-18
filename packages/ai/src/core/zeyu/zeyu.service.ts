import { inject, singleton } from "tsyringe";
import { Chess, Color, Move } from "chess.js";

import {
	PIECES_WEIGHTS,
	PST_KE_OPPONENT,
	PST_KE_SELF,
	PST_OPPONENT,
	PST_SELF
} from "../../shared";

@singleton()
export class ZeyuService {
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
			const weight = PIECES_WEIGHTS[move.captured];
			const pstOpponent = isKingEndgame
				? PST_KE_OPPONENT[move.color]
				: PST_OPPONENT[move.color][move.captured];
			const pstSelf = PST_SELF[move.color][move.captured];

			// Opponent piece was captured (good for us)
			if (move.color === color)
				prevSum += weight + (pstOpponent[to[0]]?.[to[1]] ?? 0);
			// Our piece was captured (bad for us)
			else prevSum -= weight + (pstSelf[to[0]]?.[to[1]] ?? 0);
		}

		const selfWeight = PIECES_WEIGHTS[move.piece];
		const pstSelf = isKingEndgame
			? PST_KE_SELF[move.color]
			: PST_SELF[move.color][move.piece];

		if (move.promotion) {
			const promotionWeight = PIECES_WEIGHTS[move.promotion];
			const pstPromotion = isKingEndgame
				? PST_KE_SELF[move.color]
				: PST_SELF[move.color][move.promotion];

			// Our piece was promoted (good for us)
			if (move.color === color) {
				prevSum -= selfWeight + (pstSelf[from[0]]?.[from[1]] ?? 0);
				prevSum += promotionWeight + (pstPromotion[to[0]]?.[to[1]] ?? 0);
			}
			// Opponent piece was promoted (bad for us)
			else {
				prevSum +=
					PIECES_WEIGHTS[move.piece] + (pstSelf[from[0]]?.[from[1]] ?? 0);
				prevSum -=
					PIECES_WEIGHTS[move.promotion] + (pstPromotion[to[0]]?.[to[1]] ?? 0);
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
