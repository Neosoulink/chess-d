import { inject, Lifecycle, scoped } from "tsyringe";
import { Chess } from "chess.js";

import { AiModel } from "../../shared";
import { BasicBotService } from "./basic-bot.service";

@scoped(Lifecycle.ContainerScoped)
export class BasicBotModule implements AiModel {
	public sum = 0;
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(BasicBotService) private readonly service: BasicBotService
	) {}

	public getMove() {
		const bestMove = this.service.findBestMove(this.game, 3);

		return bestMove;
	}
}
