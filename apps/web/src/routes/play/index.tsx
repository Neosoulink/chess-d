import { FC, useEffect } from "react";

import { useGame } from "../_hooks";
import { useGameStore } from "../_stores";

export const PlayRoute: FC = () => {
	const { setApp } = useGameStore();
	const {
		state: gameState,
		init: initGame,
		createPlayer: createFreePlayer,
		dispose: disposeGame
	} = useGame();

	useEffect(() => {
		if (gameState.app || gameState.isPending || gameState.isReady)
			return setApp(gameState.app);

		initGame();

		return () => {
			if (gameState.app && !gameState.isPending && gameState.isReady)
				disposeGame();
		};
	}, [createFreePlayer, disposeGame, gameState, initGame, setApp]);

	return null;
};
