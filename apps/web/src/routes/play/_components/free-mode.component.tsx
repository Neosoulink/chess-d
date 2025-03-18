import { ColorSide, DEFAULT_FEN, PlayerEntity } from "@chess-d/shared";
import { FC, Fragment, useCallback, useEffect, useRef } from "react";
import { merge } from "rxjs";

import { useGameStore, useLoaderStore } from "../../_stores";
import { PlayerModel } from "../../../shared/models";
import { GAME_UPDATED_TOKEN } from "../../../shared/tokens";
import { EngineUpdatedMessageData } from "../../../shared/types";
import { useLocation } from "react-router";
import { validateFen } from "chess.js";

export const FreeModeComponent: FC = () => {
	const location = useLocation();
	const {
		app,
		initialGameState,
		resetGame,
		setInitialGameState,
		performPieceMove
	} = useGameStore();
	const { setIsLoading } = useLoaderStore();

	const locationKeyRef = useRef<string | null>(null);

	const createPlayer = useCallback((identity: PlayerEntity) => {
		const player = new PlayerModel();
		player.color = identity.color;

		return player;
	}, []);

	useEffect(() => {
		if (
			locationKeyRef.current === location.key ||
			validateFen(`${initialGameState?.fen}`).ok
		)
			return;
		setInitialGameState({ fen: DEFAULT_FEN });
	}, [initialGameState?.fen, location.key, setInitialGameState]);

	useEffect(() => {
		if (locationKeyRef.current === location.key) return;

		locationKeyRef.current = location.key;
		setIsLoading(true);
		resetGame();

		const appModule = app?.module;
		const players = [
			createPlayer({ color: ColorSide.white }),
			createPlayer({ color: ColorSide.black })
		];

		const handleMessages = (
			payload: MessageEvent<EngineUpdatedMessageData>
		) => {
			if (!payload.data?.token) return;

			if (
				payload.data.token === GAME_UPDATED_TOKEN &&
				payload.data?.value?.fen
			) {
				players.forEach((player) => {
					player.next({
						token: "NOTIFIED",
						value: payload.data.value
					});
				});
			}
		};

		const playersSubscription = merge(...players).subscribe((payload) => {
			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value?.move);
		});

		appModule?.getWorker()?.addEventListener("message", handleMessages);

		setTimeout(() => setIsLoading(false), 100);

		return () => {
			playersSubscription.unsubscribe();
			players.forEach((player) => {
				player.complete();
				player.unsubscribe();
				players.shift();
			});
			appModule?.getWorker()?.removeEventListener("message", handleMessages);
		};
	}, [
		app,
		createPlayer,
		performPieceMove,
		location.key,
		setIsLoading,
		resetGame
	]);

	return <Fragment />;
};
