import { expose } from "threads/worker";
import { Subject } from "rxjs";
import { Chess } from "chess.js";
import { register, SupportedAiModel } from "@chess-d/ai";
import { AppLifecycleState } from "@quick-threejs/reactive";
import { ExposedAppModule } from "@quick-threejs/reactive/worker";

const lifecycle$$ = new Subject<AppLifecycleState>();
const lifecycle$ = lifecycle$$.pipe();

export const performAI = () => {
	console.log("AI is performing...");

	const game = new Chess();
	const aiModel = register(SupportedAiModel.zeyu, game);

	const bestMove = aiModel?.getMove(game.turn());

	if (bestMove) game.move(bestMove);

	console.log("Best move:", bestMove);
};

performAI();

expose({
	lifecycle$: () => lifecycle$
} satisfies ExposedAppModule);
