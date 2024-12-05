import { useCallback, useEffect, useState } from "react";
import { RegisterModule } from "@quick-threejs/reactive";
import { Move, validateFen } from "chess.js";
import { merge } from "rxjs";

import { PlayerModel } from "../models";
import { MessageEventPayload } from "../types";
import { AI_PERFORMED_MOVE_TOKEN, AI_WILL_PERFORM_MOVE_TOKEN } from "../tokens";

/** @description Ai login worker location. */
const workerLocation = new URL(
	"../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useAi = () => {
	const [players, setPlayers] = useState<PlayerModel[]>([]);

	const [workerThread, setWorkerThread] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["workerPool"]>["run"]>>
		| undefined
	>();

	const init = useCallback(async (app: RegisterModule) => {
		const _workerThread = await app.workerPool().run({
			payload: {
				path: workerLocation,
				subject: {}
			}
		});

		setWorkerThread(_workerThread);
	}, []);

	const createPlayer = useCallback(() => {
		const player = new PlayerModel();
		setPlayers((prev) => [...prev, player]);

		return player;
	}, []);

	const removePlayer = useCallback(
		(player: PlayerModel) =>
			setPlayers((prev) =>
				prev.filter((_player) => {
					if (_player !== player) return true;

					_player.unsubscribe();
					_player.complete();

					return false;
				})
			),
		[]
	);

	const dispose = useCallback(() => {
		workerThread?.thread?.terminate();
		workerThread?.worker?.terminate();

		players.forEach((player) => {
			player.unsubscribe();
			player.complete();
		});
		setPlayers([]);
	}, [players, workerThread]);

	useEffect(() => {
		const subscription = workerThread?.thread
			?.movePerformed$()
			?.subscribe((message: MessageEventPayload<{ move: Move }>) => {
				const { token, value } = message;

				if (token !== AI_PERFORMED_MOVE_TOKEN || !value) return;

				const { move } = value;

				if (!move || !validateFen(move?.after)) return;

				console.log("AI move", move, players);

				players.forEach((player) => {
					if (player.color === move.color)
						player?.next({
							token: "PLACED_PIECE",
							value: {
								move
							}
						});
				});
			});

		return () => {
			subscription?.unsubscribe();
		};
	}, [players, workerThread]);

	useEffect(() => {
		const subscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { turn, fen, move } = value || {};

			if (
				token === "NOTIFIED" &&
				move &&
				fen &&
				validateFen(fen) &&
				players.find((player) => player.color === turn)
			)
				workerThread?.worker?.postMessage?.({
					token: AI_WILL_PERFORM_MOVE_TOKEN,
					value: { fen }
				} satisfies MessageEventPayload<{ fen: string }>);
		});

		return () => {
			subscription?.unsubscribe();
		};
	}, [players, workerThread]);

	return {
		workerThread,
		players,
		init,
		createPlayer,
		removePlayer,
		dispose
	};
};
