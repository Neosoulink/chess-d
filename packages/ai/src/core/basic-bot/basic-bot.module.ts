import { inject, Lifecycle, scoped } from "tsyringe";

import { AiModel } from "../../shared";
import { BasicBotService } from "./basic-bot.service";

@scoped(Lifecycle.ContainerScoped)
export class BasicBotModule implements AiModel {
	public sum = 0;
	constructor(
		@inject(BasicBotService) private readonly service: BasicBotService
	) {}

	public getMove() {
		return this.service.findBestMove();
	}
}
