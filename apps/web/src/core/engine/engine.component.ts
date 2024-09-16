import { Chess } from "chess.js";
import { singleton } from "tsyringe";

@singleton()
export class EngineComponent {
	public readonly game = new Chess(
		"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"
	);

	constructor() {
		console.log("EngineComponent", this.game.turn());
	}
}
