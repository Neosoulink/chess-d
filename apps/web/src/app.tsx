import { useEffect, useMemo } from "react";

import { merge } from "rxjs";
import { useActions, useAi, useGame, useSocket } from "./shared/hooks";
import { PlayerModel } from "./shared/models";

export const App = () => {
	const { setup: setupGame, app } = useGame();
	const { setup: setupActions, movePiece: movePieceAction } = useActions();
	const { setup: setupAI, worker: aiWorker, player: opponentPlayer } = useAi();
	const { socket } = useSocket();

	// TODO: Players color should be defined by the user.
	const currentPlayer = useMemo(() => new PlayerModel(), []);

	// Setting up the game.
	useEffect(() => {
		if (!app) setupGame();

		return () => {
			app?.dispose();
		};
	}, [app, setupGame]);

	// Setting up the game actions.
	useEffect(() => {
		if (app) setupActions(app);

		return () => {};
	}, [app, setupActions]);

	// Setting up the AI player.
	useEffect(() => {
		if (app && !aiWorker) setupAI(app);

		return () => {
			aiWorker?.worker?.terminate?.();
		};
	}, [app, setupAI, aiWorker]);

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

	return <div />;
};
