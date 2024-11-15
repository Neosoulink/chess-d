import { useCallback, useEffect, useMemo, useState } from "react";
import { RegisterModule } from "@quick-threejs/reactive";

import { PlayerModel } from "../models";
import { MoveLike } from "../types";

/** @description Ai login worker location. */
const workerLocation = new URL(
	"../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useAi = () => {
	const player = useMemo(() => new PlayerModel(), []);

	const [worker, setWorker] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["workerPool"]>["run"]>>
		| undefined
	>();

	const setup = useCallback(async (app: RegisterModule) => {
		const _worker = await app.workerPool().run({
			payload: {
				path: workerLocation,
				subject: {}
			}
		});

		setTimeout(() => {
			_worker?.worker.postMessage?.({
				type: "perform_move",
				payload: { move: {} }
			});
		}, 100);

		setWorker(_worker);
	}, []);

	useEffect(() => {
		if (worker?.thread)
			worker.thread
				?.movePerformed$()
				?.subscribe((message: { payload: MoveLike }) => {
					player.pickPiece(message.payload.piece, message.payload.from);
					player.movePiece(message.payload.to);
				});
	}, [worker, player]);

	return {
		setup,
		worker,
		player
	};
};
