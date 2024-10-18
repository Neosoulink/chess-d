import { isObject } from "@quick-threejs/utils";
import { Chess } from "chess.js";
import { container } from "tsyringe";

import { AiModel, SupportedAiModel } from "../shared";
import { ZeyuModule } from "./zeyu/zeyu.module";

/**
 * @description
 */
export const register = (
	model: SupportedAiModel,
	app: Chess
): AiModel | undefined => {
	if (!isObject(app))
		throw new Error("Unable to retrieve the application context.");

	container.register(Chess, {
		useValue: app
	});

	if (model === SupportedAiModel.zeyu)
		return container.resolve<AiModel>(ZeyuModule);

	return undefined;
};
