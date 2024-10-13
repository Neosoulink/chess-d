import { Chess } from "chess.js";
import { inject, singleton } from "tsyringe";

import { fenToCoords } from "../../shared";

@singleton()
export class EngineComponent {
	constructor(@inject(Chess) public readonly game: Chess) {}

	public getFenCoords() {
		return fenToCoords(this.game.fen());
	}
}
