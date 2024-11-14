import { RegisterModule } from "@quick-threejs/reactive";
import {
	WorkerThreadModule,
	WorkerThreadResolution
} from "@quick-threejs/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
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
		setWorker(
			await app.workerPool().run({
				payload: {
					path: workerLocation,
					subject: {}
				}
			})
		);
	}, []);

	useEffect(() => {
		if (worker?.thread)
			worker.thread?.movePerformed$()?.subscribe((payload: MoveLike) => {
				console.log("AI move performed...", payload);

				player.pickPiece(payload.piece, payload.from);
				player.movePiece(payload.to);
			});
	}, [worker, player]);

	return {
		setup,
		worker,
		player
	};
};
