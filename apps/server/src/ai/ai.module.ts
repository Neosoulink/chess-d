import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AiChessController } from "./ai.controller";
import { LlmProxyService } from "./services/llm-proxy.service";

@Module({
	imports: [ConfigModule],
	controllers: [AiChessController],
	providers: [LlmProxyService]
})
export class AiModule {}
