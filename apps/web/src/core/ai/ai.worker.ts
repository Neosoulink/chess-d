import "reflect-metadata";

import { container } from "tsyringe";
import { expose } from "threads/worker";
import { Chess } from "chess.js";
import { ExposedAppModule } from "@quick-threejs/reactive/worker";

import { AiModule } from "./ai.module";

const game = new Chess();

container.register(Chess, { useValue: game });

const aiModule = container.resolve(AiModule);
aiModule.init();

const exposedAiModule = {
	movePerformed$: aiModule.controller.movePerformed$$.pipe.bind(
		aiModule.controller.movePerformed$$
	)
};

expose(exposedAiModule satisfies ExposedAppModule);

export type ExposedAModule = typeof exposedAiModule;
