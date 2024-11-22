import { useEffect, useMemo } from "react";

import { merge, Subscription } from "rxjs";
import { useAi, useGame, useSocket } from "./shared/hooks";
import { PlayerModel } from "./shared/models";
import { SOCKET_PERFORM_MOVE_TOKEN } from "@chess-d/shared";

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
	}, [app, setupGame]);

	// Setting up the AI player.
	useEffect(() => {
		if (app && !aiWorkerThread) setupAI(app);

		return () => {
			aiWorkerThread?.worker?.terminate?.();
		};
	}, [app, setupAI, aiWorkerThread]);

	// Setting up the socket player.
	useEffect(() => {
		if (app && !socket.connected) {
			socket.connect();
			socket.on("disconnect", (r, d) => {
				console.log("disconnect ==>", r, d);
			});
		}

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

			socket?.emit(SOCKET_PERFORM_MOVE_TOKEN, payload);
		});
	}, [opponentPlayer?.notify$$, gameUpdatedCallbackRegister, socket]);

	return <div />;
};
