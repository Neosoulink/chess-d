import { FC, useEffect } from "react";
import { useLocation } from "react-router";
import { merge, Subscription } from "rxjs";

import { useAi, useGame } from "../shared/hooks";
import { getGameModeFromUrl } from "../shared/utils";

export const PlayRoute: FC = () => {
	const location = useLocation();

	const {
		app: gameApp,
		state: gameState,
		init: initGame,
		players: freePlayers,
		createPlayer: createFreePlayer,
		dispose: disposeGame,
		performPieceMove,
		onGameUpdate
	} = useGame();
	const {
		players: aiPlayers,
		init: initAI,
		createPlayer: createAIPlayer,
		dispose: disposeAi
	} = useAi();
	// const {} = useSocket();

	useEffect(() => {
		if (gameState.app || gameState.isPending || gameState.isReady) {
			return;
		}

		initGame();

		return () => {
			if (gameState.app && !gameState.isPending && gameState.isReady)
				disposeGame();
		};
	}, [disposeGame, gameApp, gameState, initAI, initGame]);

	useEffect(() => {
		if (!gameApp) return;

		initAI(gameApp);

		createFreePlayer();
		createAIPlayer();

		return () => {};
	}, [createAIPlayer, createFreePlayer, gameApp, initAI]);

	useEffect(() => {
		const players = [...aiPlayers, ...freePlayers];

		const playersSubscription: Subscription = merge(...players).subscribe(
			(payload) => {
				if (payload.token === "PLACED_PIECE" && payload.value?.move)
					return performPieceMove(payload.value?.move);
			}
		);

		onGameUpdate((payload) => {
			console.log("Game updated", payload);

			players.forEach((player) => {
				player.next({
					token: "NOTIFIED",
					value: payload
				});
			});
		});

		return () => playersSubscription.unsubscribe();
	}, [aiPlayers, freePlayers, onGameUpdate, performPieceMove]);

	return null;
};
