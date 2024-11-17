import { useCallback, useEffect, useMemo, useState } from "react";
import { RegisterModule } from "@quick-threejs/reactive";

import { PlayerModel } from "../models";
import { MessageEventPayload, MoveLike } from "../types";

/** @description Ai login worker location. */
const workerLocation = new URL(
	"../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useAi = () => {
	const player = useMemo(() => new PlayerModel(), []);

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
	}, []);

	useEffect(() => {
		if (workerThread?.thread)
			workerThread.thread
				?.movePerformed$()
				?.subscribe((message: MessageEventPayload<MoveLike>) => {
					if (!message.value) return;

					player.pickPiece(message.value?.piece, message.value?.from);
					player.movePiece(message.value);
				});
	}, [workerThread, player]);

	return {
		setup,
		workerThread,
		player
	};
};
