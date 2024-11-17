import { useEffect, useMemo } from "react";

import { merge } from "rxjs";
import { useActions, useAi, useGame, useSocket } from "./shared/hooks";
import { PlayerModel } from "./shared/models";
import { MessageEventPayload } from "./shared/types";
import { AI_WILL_PERFORM_MOVE_TOKEN } from "./shared/tokens";

export const App = () => {
	const {
		setup: setupGame,
		app,
		dispose: disposeApp,
		gameUpdatedCallbackRegister
	} = useGame();
	const { setup: setupActions, movePiece: movePieceAction } = useActions();
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

	// Setting up the game actions.
	useEffect(() => {
		if (app) setupActions(app);

		return () => {};
	}, [app, setupActions]);

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
		const playersActionsSubscription = merge(
			currentPlayer.pieceMoved$$,
			opponentPlayer.pieceMoved$$
		).subscribe((move) => {
			movePieceAction(move);
		});

		return () => {
			playersActionsSubscription.unsubscribe();
		};
	}, [
		currentPlayer.pieceMoved$$,
		movePieceAction,
		opponentPlayer.pieceMoved$$
	]);

	useEffect(() => {
		gameUpdatedCallbackRegister((fen) => {
			console.log("Game changed", fen);

			aiWorkerThread?.worker.postMessage?.({
				token: AI_WILL_PERFORM_MOVE_TOKEN,
				value: { fen }
			} satisfies MessageEventPayload<{ fen: string }>);
		});
	}, [aiWorkerThread?.worker, gameUpdatedCallbackRegister]);

	return <div />;
};
