import { useCallback, useEffect, useState } from "react";
import { RegisterModule } from "@quick-threejs/reactive";

import { PlayerModel } from "../models";
import { MessageEventPayload, MoveLike } from "../types";
import { validateFen } from "chess.js";
import { AI_WILL_PERFORM_MOVE_TOKEN } from "../tokens";

/** @description Ai login worker location. */
const workerLocation = new URL(
	"../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useAi = () => {
	const [player, setPlayer] = useState<PlayerModel | undefined>();

	const [workerThread, setWorkerThread] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["workerPool"]>["run"]>>
		| undefined
	>();

	const setup = useCallback(async (app: RegisterModule) => {
		const _workerThread = await app.workerPool().run({
			payload: {
				path: workerLocation,
				subject: {}
			}
		});

		setWorkerThread(_workerThread);
		setPlayer(new PlayerModel());
	}, []);

	useEffect(() => {
		workerThread?.thread
			?.movePerformed$()
			?.subscribe((message: MessageEventPayload<MoveLike>) => {
				if (!message.value) return;

				player?.pickPiece(message.value?.piece, message.value?.from);
				player?.movePiece(message.value);
			});
	}, [workerThread, player]);

	useEffect(() => {
		const subscription = player?.notifyForPlayer$.subscribe((payload) => {
			if (payload?.fen && validateFen(payload.fen))
				workerThread?.worker.postMessage?.({
					token: AI_WILL_PERFORM_MOVE_TOKEN,
					value: { fen: payload.fen }
				} satisfies MessageEventPayload<{ fen: string }>);
		});

		return () => {
			subscription?.unsubscribe();
		};
	}, [player?.notify$$, player?.notifyForPlayer$, workerThread?.worker]);

	return {
		setup,
		workerThread,
		player
	};
};
