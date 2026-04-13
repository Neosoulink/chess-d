import { FC, useEffect, useMemo, useState } from "react";

import { EngineUpdatedMessageData } from "@/shared/types";
import { GAME_UPDATED_TOKEN } from "@/shared/tokens";
import { useGameStore } from "@/router/_stores";

/** @internal */
const getStatusMsg = (status?: EngineUpdatedMessageData["value"]) => {
	if (status?.isCheckmate) return "Checkmate!";

	if (status?.isInsufficientMaterial)
		return "Draw due to insufficient material";

	if (status?.isThreefoldRepetition) return "Draw due to threefold repetition";

	if (status?.isStalemate) return "Draw due to stalemate";

	if (status?.isDraw) return "Draw due to fifty-move rule";

	if (status?.inCheck) return "In check!";

	if (status?.isCheck) return "Check!";

	if (status?.isGameOver) return "Game over";

	return "Game in progress";
};

export const GameOverviewStatus: FC = () => {
	const { app, gameState } = useGameStore();

	const [status, setStatus] = useState<EngineUpdatedMessageData["value"]>();

	const statusMsg = useMemo(() => {
		return getStatusMsg(status);
	}, [status]);
	const currentTurn = useMemo(() => {
		return status?.turn ?? "";
	}, [status?.turn]);

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorkerThread()?.worker as
			| Worker
			| undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			if (e.data?.token !== GAME_UPDATED_TOKEN || !e.data?.value) return;

			setStatus(e.data.value);
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app]);

	return (
		<div className="flex gap-1 items-center justify-end text-sm">
			{!!currentTurn && (
				<p className="h-8 px-2 flex items-center justify-center bg-dark/80">
					{currentTurn === gameState?.playerSide ? "Your" : "Opponent's"} turn
				</p>
			)}

			<p className="h-8 px-2 flex items-center justify-center bg-dark/80">
				{statusMsg}
			</p>
		</div>
	);
};
