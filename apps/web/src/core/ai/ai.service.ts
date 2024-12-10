import { register, SupportedAiModel } from "@chess-d/ai";
import { inject, singleton } from "tsyringe";
import { Chess, validateFen } from "chess.js";

@singleton()
export class AiService {
	constructor(@inject(Chess) private readonly game: Chess) {}

	public handleWillPerformMove = (ai?: SupportedAiModel, fen?: string) => {
		if (!ai) return console.warn("Received invalid AI model");

		if (!fen || !validateFen(fen).ok)
			return console.warn("AI received invalid FEN string");

		this.game.load(fen);
		const { container, model } = register(ai, this.game);
		const move = model?.getMove(this.game.turn());

		container.clearInstances();

		return move;
	};
}
