import { useEffect, useMemo } from "react";

import { merge, Subscription } from "rxjs";
import { useAi, useGame, useSocket } from "./shared/hooks";
import { PlayerModel } from "./shared/models";

export const App = () => {
	const {
		setup: setupGame,
		app,
		movePiece,
		dispose: disposeApp,
		gameUpdatedCallbackRegister
	} = useGame();
	const {
		setup: setupAI,
		workerThread: aiWorkerThread,
		player: opponentPlayer
	} = useAi();
	const { socket } = useSocket();

	// TODO: Players color should be defined by the user.
	const currentPlayer = useMemo(() => new PlayerModel(), []);

	// Setting up the game.
	useEffect(() => {
		if (!app) setupGame();

		return () => {
			disposeApp();
		};
	}, [app, setupGame, disposeApp]);

	// Setting up the AI player.
	useEffect(() => {
		if (app && !aiWorkerThread) setupAI(app);

		return () => {
			aiWorkerThread?.worker?.terminate?.();
		};
	}, [app, setupAI, aiWorkerThread]);

	// Setting up the socket player.
	useEffect(() => {
		if (app && !socket.connected) socket.connect();

		return () => {
			socket.disconnect();
		};
	}, [app, socket]);

	// Setting up the socket player.
	useEffect(() => {
		let playersActionsSubscription: Subscription | undefined;
		if (currentPlayer && opponentPlayer)
			playersActionsSubscription = merge(
				currentPlayer.pieceMoved$$,
				opponentPlayer.pieceMoved$$
			).subscribe((move) => {
				movePiece(move);
			});

		return () => {
			playersActionsSubscription?.unsubscribe();
		};
	}, [currentPlayer, movePiece, opponentPlayer]);

	useEffect(() => {
		gameUpdatedCallbackRegister((payload) => {
			opponentPlayer?.notify$$?.next({
				fen: payload?.fen,
				turn: payload?.turn
			});
		});
	}, [opponentPlayer?.notify$$, gameUpdatedCallbackRegister]);

	return <div />;
};
