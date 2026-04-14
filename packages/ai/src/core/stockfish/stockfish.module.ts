import { inject, Lifecycle, scoped } from "tsyringe";

import { AiModel } from "../../shared";
import { StockfishService } from "./stockfish.service";

@scoped(Lifecycle.ContainerScoped)
export class StockfishModule implements AiModel {
	constructor(
		@inject(StockfishService)
		private readonly stockfishService: StockfishService
	) {}

	getMove() {
		return this.stockfishService.getMove();
	}
}
