import { expose } from "threads/worker";
import { Subject } from "rxjs";
import { Chess, Move } from "chess.js";
import { register, SupportedAiModel } from "@chess-d/ai";
import { AppLifecycleState } from "@quick-threejs/reactive";
import { ExposedAppModule } from "@quick-threejs/reactive/worker";

const lifecycle$$ = new Subject<AppLifecycleState>();
const movePerformed$$ = new Subject<Move>();
const lifecycle$ = lifecycle$$.pipe();
const movePerformed$ = movePerformed$$.pipe();

expose({
	movePerformed$: () => movePerformed$,
	lifecycle$: () => lifecycle$
} satisfies ExposedAppModule);

export const performAI = () => {
	console.log("AI is performing...");

	const game = new Chess(
		"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"
	);
	const aiModel = register(SupportedAiModel.zeyu, game);

	const move = aiModel?.getMove(game.turn());

	if (move) {
		game.move(move);
		movePerformed$$.next(move);
	}
};

setTimeout(() => {
	performAI();
}, 100);
