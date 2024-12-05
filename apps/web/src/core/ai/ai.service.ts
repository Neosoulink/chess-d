import { inject, singleton } from "tsyringe";
import { Chess, validateFen } from "chess.js";
import { AiModel } from "@chess-d/ai";

@singleton()
export class AiService {
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(AiModel) private readonly ai: AiModel
	) {}

	public handleWillPerformMove = (fen?: string) => {
		if (!fen || !validateFen(fen))
			return console.warn("AI received invalid FEN string");

		this.game.load(fen);

		return this.ai?.getMove(this.game.turn());
	};
}
