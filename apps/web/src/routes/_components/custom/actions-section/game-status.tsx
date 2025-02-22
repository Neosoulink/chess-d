import { FC, useEffect, useState } from "react";

import { GAME_UPDATED_TOKEN } from "../../../../shared/tokens";
import { useGameStore } from "../../../_stores";
import { EngineUpdatedMessageData } from "../../../../shared/types";

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

	return "Game is in progress";
};

export const ActionsSectionGameStatus: FC = () => {
	const { app } = useGameStore();

	const [statusMsg, setStatusMsg] = useState<string>(getStatusMsg());

	useEffect(() => {
		const appModule = app?.module;
		const appWorker = appModule?.getWorker() as Worker | undefined;

		const handleMessages = (e: MessageEvent<EngineUpdatedMessageData>) => {
			if (e.data?.token !== GAME_UPDATED_TOKEN || !e.data?.value) return;

			setStatusMsg(getStatusMsg(e.data.value));
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app]);

	return <h3 className="text-gray-50">{statusMsg}</h3>;
};
