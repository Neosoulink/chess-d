import { Chess } from "chess.js";
import { container as parentContainer, DependencyContainer } from "tsyringe";

import { AiModel, SupportedAiModel } from "../shared";
import { ZeyuModule } from "./zeyu/zeyu.module";

export interface RegisterReturn {
	container: DependencyContainer;
	model: AiModel | undefined;
}

/** @description Registers the AI model to be used in the game. */
export const register = (
	aiModel: SupportedAiModel,
	game: Chess
): RegisterReturn => {
	if (typeof game !== "object")
		throw new Error("Unable to retrieve the game context.");

	const container = parentContainer.createChildContainer();
	container.register(Chess, {
		useValue: game
	});

	let model: AiModel | undefined = undefined;

	if (aiModel === SupportedAiModel.zeyu)
		model = container.resolve<AiModel>(ZeyuModule);

	return {
		container,
		model
	};
};
