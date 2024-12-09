import { Move } from "chess.js";
import { FC, useEffect } from "react";
import { merge, Subscription } from "rxjs";

import { EngineGameUpdatedMessageEventPayload } from "../../../shared/types";
import { useAi } from "../../_hooks";
import { useGameStore } from "../../_stores";

export interface WithAIComponentProps {
	performPieceMove: (move: Move) => void;
	onGameUpdate: (
		callback: (
			payload: EngineGameUpdatedMessageEventPayload["value"]
		) => unknown
	) => void;
}

export const WithAIComponent: FC<WithAIComponentProps> = ({
	performPieceMove,
	onGameUpdate
}) => {
	const { app: gameApp } = useGameStore();
	const {
		players: aiPlayers,
		init: initAI,
		createPlayer: createAIPlayer,
		dispose: disposeAi
	} = useAi();

	useEffect(() => {
		if (gameApp) {
			initAI(gameApp.workerPool());
			createAIPlayer();
		}

		return () => disposeAi();
	}, [createAIPlayer, disposeAi, gameApp, initAI]);

	useEffect(() => {
		const players = [...aiPlayers];

		const playersSubscription: Subscription = merge(...players).subscribe(
			(payload) => {
				if (payload.token === "PLACED_PIECE" && payload.value?.move)
					return performPieceMove(payload.value?.move);
			}
		);

		onGameUpdate((payload) => {
			console.log("Game updated", payload);

			players.forEach((player) => {
				player?.next({
					token: "NOTIFIED",
					value: payload
				});
			});
		});

		return () => playersSubscription.unsubscribe();
	}, [aiPlayers, performPieceMove, onGameUpdate]);

	return null;
};
