import { SupportedAiProvider } from "@chess-d/shared";
import { inject, Lifecycle, scoped } from "tsyringe";

import { AiModel } from "../../shared";
import { LlmService } from "./llm.service";

@scoped(Lifecycle.ContainerScoped)
export class LlmClaudeModule implements AiModel {
	constructor(@inject(LlmService) private readonly _llmService: LlmService) {}

	getMove() {
		return this._llmService.getProviderMove(SupportedAiProvider.anthropic);
	}
}
