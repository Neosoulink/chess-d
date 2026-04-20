import { AiWillPerformMovePayload } from "@/shared/types";
import { register, SupportedAiModel } from "@chess-d/ai";
import { Chess, Move, validateFen } from "chess.js";
import { inject, Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class AiService {
	constructor(@inject(Chess) private readonly game: Chess) {}

	public handleWillPerformMove = async ({
		ai,
		fen,
		registerOptions
	}: AiWillPerformMovePayload): Promise<Move | null | undefined> => {
		if (!ai || !Object.values(SupportedAiModel).includes(ai)) {
			console.warn("Received invalid AI model");
			return undefined;
		}

		if (!fen || !validateFen(fen).ok) {
			console.warn("AI received invalid FEN string");
			return undefined;
		}

		this.game.load(fen);

		const { container, model } = register(ai, this.game, registerOptions);
		const raw = model?.getMove(this.game.turn());
		const move = await Promise.resolve(raw);

		container.clearInstances();

		return move;
	};
}
