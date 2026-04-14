import { Chess, Move } from "chess.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { AiRegisterOptions, REGISTER_OPTIONS_TOKEN } from "../../shared";
import { BasicBotService } from "../basic-bot/basic-bot.service";
import {
	AI_MIN_DEPTH,
	AI_STOCKFISH_DEFAULT_DEPTH,
	AI_STOCKFISH_MAX_DEPTH
} from "@chess-d/shared";

const CHESS_API_URL = "https://chess-api.com/v1";

type ChessApiResponse = {
	type?: string;
	move?: string;
	lan?: string;
	from?: string;
	to?: string;
	promotion?: string;
	eval?: number;
	depth?: number;
	text?: string;
	error?: string;
};

@scoped(Lifecycle.ContainerScoped)
export class StockfishService {
	constructor(
		@inject(Chess) private readonly game: Chess,
		@inject(BasicBotService) private readonly basicBot: BasicBotService,
		@inject(REGISTER_OPTIONS_TOKEN)
		private readonly options: AiRegisterOptions | undefined
	) {}

	async getMove(): Promise<Move | null> {
		const legal = this.game.moves({ verbose: true });
		if (legal.length === 0) return null;

		try {
			const fen = this.game.fen();
			const depth = Math.min(
				Math.max(
					AI_MIN_DEPTH,
					typeof this.options?.depth === "number"
						? this.options.depth
						: AI_STOCKFISH_DEFAULT_DEPTH
				),
				AI_STOCKFISH_MAX_DEPTH
			);

			const res = await fetch(CHESS_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fen, depth, maxThinkingTime: 100 })
			});

			if (!res.ok)
				throw new Error(`API error: ${res.status}: ${await res.text()}`);

			const data = (await res.json()) as ChessApiResponse;

			if (data.error) throw new Error(`chess-api.com error: ${data.error}`);

			const uci = data.move || data.lan;
			if (!uci) throw new Error(`No move found: ${JSON.stringify(data)}`);

			const found = legal.find(
				(m) => m.from + m.to + (m.promotion ?? "") === uci
			);
			if (found) return found;

			throw new Error(`UCI "${uci}" did not match a legal move`);
		} catch (error) {
			console.warn(
				"[chess-d/ai] Stockfish (chess-api.com) failed:",
				error instanceof Error ? error.message : String(error),
				"— falling back to basic bot."
			);
			return this.basicBot.findBestMove();
		}
	}
}
