import { FC, useCallback, useEffect, useMemo } from "react";

import { useGame } from "../shared/hooks";
import { getGameModeFromUrl } from "../shared/utils";
import { useLocation } from "react-router";

export const PlayRoute: FC = () => {
	const location = useLocation();

	const { state: gameState, init: initGame, dispose: disposeGame } = useGame();

	useEffect(() => {
		if (!gameState.app && !gameState.isPending && !gameState.isReady) {
			getGameModeFromUrl();
			initGame();
		}

		return () => {
			if (gameState.app && !gameState.isPending && gameState.isReady)
				disposeGame();
		};
	}, [disposeGame, gameState, initGame, location]);

	return null;
};
