import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";

import { LlmMoveDto } from "./dto";
import { LlmProxyService } from "./services/llm-proxy.service";

@Controller("ai")
export class AiChessController {
	constructor(private readonly llmProxy: LlmProxyService) {}

	@Get("health")
	health() {
		return { ok: true, service: "ai" };
	}

	@Post("llm/move")
	@HttpCode(200)
	async llmMove(@Body() body: LlmMoveDto) {
		const text = await this.llmProxy.completeMove(
			body.provider,
			body.fen,
			body.legalUci,
			body.model
		);
		return { text };
	}
}
