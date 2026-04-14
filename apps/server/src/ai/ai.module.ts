import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AiChessController } from "./ai.controller";
import { LlmProxyService } from "./services/llm-proxy.service";
import { StockfishEngineService } from "./services/stockfish-engine.service";

@Module({
	imports: [ConfigModule],
	controllers: [AiChessController],
	providers: [StockfishEngineService, LlmProxyService]
})
export class AiModule {}
