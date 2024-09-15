import { Chess } from "chess.js";
import { singleton } from "tsyringe";

@singleton()
export class EngineComponent {
	public readonly game = new Chess();

	constructor() {}
}
