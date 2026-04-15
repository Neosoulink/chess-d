import { GameState } from "../types";

export const getGameStateLabel = (state?: GameState) => {
	return state?.isCheckmate
		? "Checkmate!"
		: state?.isInsufficientMaterial
			? "Insufficient material draw"
			: state?.isThreefoldRepetition
				? "Threefold repetition draw"
				: state?.isStalemate
					? "Stalemate draw"
					: state?.isDraw
						? "Fifty-move rule draw"
						: state?.inCheck
							? "In check"
							: state?.isCheck
								? "Check"
								: state?.isGameOver
									? "Game over"
									: "In progress";
};
