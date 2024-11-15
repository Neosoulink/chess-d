import { inject, singleton } from "tsyringe";
import { Chess } from "chess.js";
import { AiModel } from "@chess-d/ai";

@singleton()
export class AiService {
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(AiModel) private readonly ai: AiModel
	) {}

	public performMove = () => {
		return this.ai?.getMove(this.game.turn());
	};
}
