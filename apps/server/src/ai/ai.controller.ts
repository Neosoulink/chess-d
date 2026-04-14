import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";

import { LlmMoveDto, StockfishBestMoveDto } from "./dto";
import { LlmProxyService } from "./services/llm-proxy.service";
import { StockfishEngineService } from "./services/stockfish-engine.service";

@Controller("ai")
export class AiChessController {
	constructor(
		private readonly stockfish: StockfishEngineService,
		private readonly llmProxy: LlmProxyService
	) {}

	@Get("health")
	health() {
		return {
			ok: true,
			service: "ai",
			stockfish: this.stockfish.engineReady
				? { ready: true }
				: {
						ready: false,
						error: this.stockfish.lastBootError
					}
		};
	}

	@Post("stockfish/best-move")
	@HttpCode(200)
	async stockfishBestMove(@Body() body: StockfishBestMoveDto) {
		const moveTimeMs = body.moveTimeMs ?? 400;
		const uci = await this.stockfish.getBestMoveUci(body.fen, moveTimeMs);
		return { uci };
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
