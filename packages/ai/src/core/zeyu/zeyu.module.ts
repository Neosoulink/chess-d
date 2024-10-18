import { inject, singleton } from "tsyringe";
import { Color } from "chess.js";

import { AiModel } from "../../shared";
import { ZeyuService } from "./zeyu.service";

@singleton()
export class ZeyuModule implements AiModel {
	public sum = 0;
	constructor(@inject(ZeyuService) private readonly service: ZeyuService) {}

	public getMove(color: Color) {
		const [bestMove] = this.service.minimax(
			3,
			Number.NEGATIVE_INFINITY,
			Number.POSITIVE_INFINITY,
			true,
			this.sum,
			color
		);

		return bestMove;
	}
}
