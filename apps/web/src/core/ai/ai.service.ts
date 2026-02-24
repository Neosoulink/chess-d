import { register, SupportedAiModel } from "@chess-d/ai";
import { Chess, validateFen } from "chess.js";
import { inject, Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class AiService {
	constructor(@inject(Chess) private readonly game: Chess) {}

	public handleWillPerformMove = (ai?: SupportedAiModel, fen?: string) => {
		if (!ai || !Object.values(SupportedAiModel).includes(ai))
			return console.warn("Received invalid AI model");

		if (!fen || !validateFen(fen).ok)
			return console.warn("AI received invalid FEN string");

		this.game.load(fen);

		const { container, model } = register(ai, this.game);
		const move = model?.getMove(this.game.turn());

		container.clearInstances();

		return move;
	};
}
