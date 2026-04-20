import { Chess } from "chess.js";
import { container as parentContainer, DependencyContainer } from "tsyringe";

import {
	AiModel,
	AiRegisterOptions,
	REGISTER_OPTIONS_TOKEN,
	SupportedAiModel
} from "../shared";
import { ZeyuModule } from "./zeyu/zeyu.module";
import { BasicBotModule } from "./basic-bot/basic-bot.module";
import { LlmClaudeModule } from "./llm/claude.module";
import { LlmGeminiModule } from "./llm/gemini.module";
import { LlmOpenAiModule } from "./llm/openai.module";
import { StockfishModule } from "./stockfish/stockfish.module";

export interface RegisterReturn {
	container: DependencyContainer;
	model: AiModel | undefined;
}

/** @description Registers the AI model to be used in the game. */
export const register = (
	aiModel: SupportedAiModel,
	game: Chess,
	options?: AiRegisterOptions
): RegisterReturn => {
	if (typeof game !== "object")
		throw new Error("Unable to retrieve the game context.");

	const container = parentContainer.createChildContainer();

	let model: AiModel | undefined = undefined;

	container.register(Chess, {
		useValue: game
	});

	container.register(REGISTER_OPTIONS_TOKEN, {
		useValue: options
	});

	if (aiModel === SupportedAiModel.zeyu)
		model = container.resolve<AiModel>(ZeyuModule);

	if (aiModel === SupportedAiModel.basicBot)
		model = container.resolve<AiModel>(BasicBotModule);

	if (aiModel === SupportedAiModel.stockfish)
		model = container.resolve<AiModel>(StockfishModule);

	if (aiModel === SupportedAiModel.openAiChatGpt)
		model = container.resolve<AiModel>(LlmOpenAiModule);

	if (aiModel === SupportedAiModel.googleGemini)
		model = container.resolve<AiModel>(LlmGeminiModule);

	if (aiModel === SupportedAiModel.anthropicClaude)
		model = container.resolve<AiModel>(LlmClaudeModule);

	return {
		container,
		model
	};
};
