import { DEFAULT_FEN } from "@chess-d/shared";
import { Chess } from "chess.js";
import { inject, singleton } from "tsyringe";

import { PiecesService } from "./pieces/pieces.service";

@singleton()
export class GameService {
	constructor(
		@inject(Chess) private readonly chess: Chess,
		@inject(PiecesService) private readonly pieces: PiecesService
	) {}

	reset(fen = DEFAULT_FEN): void {
		this.chess.load(fen);
		this.pieces.reset(fen);
	}
}
