import { FC, useEffect } from "react";
import { useLocation } from "react-router";
import { merge, Subscription } from "rxjs";

import { useAi, useGame, useSocket } from "../shared/hooks";
import { getGameModeFromUrl } from "../shared/utils";

export const PlayRoute: FC = () => {
	const location = useLocation();

	const {
		app: gameApp,
		state: gameState,
		init: initGame,
		players: freePlayers,
		createPlayer: createFreePlayer,
		removePlayer: removeFreePlayer,
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
	const {
		init: initSocket,
		currentPlayer: currentSocketPlayer,
		opponentPlayer: opponentSocketPlayer
	} = useSocket();

	useEffect(() => {
		if (gameState.app || gameState.isPending || gameState.isReady) {
			return;
		}

		initGame();

		return () => {
			if (gameState.app && !gameState.isPending && gameState.isReady)
				disposeGame();
		};
	}, [createFreePlayer, disposeGame, gameState, initGame]);

	useEffect(() => {
		if (!gameApp) return;

		const player = createFreePlayer();

		return () => removeFreePlayer(player);
	}, [createFreePlayer, gameApp, removeFreePlayer]);

	useEffect(() => {
		if (!gameApp) return;

		initAI(gameApp);
		createAIPlayer();

		return () => {};
	}, [createAIPlayer, gameApp, initAI]);

	useEffect(() => {
		if (!gameApp) return;

		initSocket();

		return () => {};
	}, [gameApp, initSocket]);

	useEffect(() => {
		const players = [...aiPlayers, ...freePlayers];

		if (currentSocketPlayer) players.push(currentSocketPlayer);
		if (opponentSocketPlayer) players.push(opponentSocketPlayer);

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
	}, [
		aiPlayers,
		currentSocketPlayer,
		freePlayers,
		onGameUpdate,
		opponentSocketPlayer,
		performPieceMove
	]);

	return null;
};
