import "reflect-metadata";

import { container } from "tsyringe";
import { expose } from "threads/worker";
import { Chess } from "chess.js";
import { ExposedAppModule } from "@quick-threejs/reactive/worker";

import { AiModule } from "./ai.module";

const game = new Chess(
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"
);

container.register(Chess, { useValue: game });

const aiModule = container.resolve(AiModule);
aiModule.init();
aiModule.lifecycle$().subscribe({ complete: () => container.dispose() });

const exposedAiModule = {
	movePerformed$: aiModule.controller.movePerformed$$.pipe.bind(
		aiModule.controller.movePerformed$$
	),
	lifecycle$: aiModule.lifecycle$.bind(aiModule)
};

expose(exposedAiModule satisfies ExposedAppModule);

export type ExposedAModule = typeof exposedAiModule;
