import { AI_DEFAULT_DEPTH, AI_MAX_DEPTH, AI_MIN_DEPTH } from "@chess-d/shared";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Color } from "chess.js";

import {
	AiModel,
	AiRegisterOptions,
	REGISTER_OPTIONS_TOKEN
} from "../../shared";
import { ZeyuService } from "./zeyu.service";

@scoped(Lifecycle.ContainerScoped)
export class ZeyuModule implements AiModel {
	public sum = 0;
	constructor(
		@inject(ZeyuService) private readonly service: ZeyuService,
		@inject(REGISTER_OPTIONS_TOKEN)
		private readonly options: AiRegisterOptions | undefined
	) {}

	public getMove(color: Color) {
		const [bestMove] = this.service.minimax(
			Math.min(
				Math.max(
					AI_MIN_DEPTH,
					typeof this.options?.depth === "number"
						? this.options.depth
						: AI_DEFAULT_DEPTH
				),
				AI_MAX_DEPTH
			),
			Number.NEGATIVE_INFINITY,
			Number.POSITIVE_INFINITY,
			true,
			this.sum,
			color
		);

		return bestMove;
	}
}
