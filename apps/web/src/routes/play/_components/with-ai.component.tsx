import { SupportedAiModel, SupportedAiModelKey } from "@chess-d/ai";
import { ColorSide, DEFAULT_FEN, getOppositeColorSide } from "@chess-d/shared";
import { RegisterModule } from "@quick-threejs/reactive";
import { WorkerThread } from "@quick-threejs/worker";
import { Move, validateFen } from "chess.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { merge, Subscription } from "rxjs";

import { GameMode } from "../../../shared/enum";
import { PlayerModel } from "../../../shared/models";
import { EngineUpdatedMessageData, MessageData } from "../../../shared/types";
import {
	AI_PERFORMED_MOVE_TOKEN,
	AI_WILL_PERFORM_MOVE_TOKEN,
	GAME_RESET_TOKEN,
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";
import { getGameModeFromUrl } from "../../../shared/utils";
import { useGameStore, useLoaderStore } from "../../_stores";

export interface WithAIComponentProps {}

/** @internal */
const devMode = import.meta.env?.DEV;

/** @internal */
const aiWorkerLocation = new URL(
	devMode ? "../../../core/ai/ai.worker.ts" : "./ai-worker.js",
	import.meta.url
) as unknown as string;

export const WithAIComponent: FC<WithAIComponentProps> = () => {
	const { app, initialGameState, resetGame, setInitialGameState } =
		useGameStore();
	const { setIsLoading } = useLoaderStore();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const { module: appModule } = app ?? {};

	const [aiWorker, setAiWorker] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["getWorkerPool"]>["run"]>>
		| undefined
	>();
	const [resetInitialGameState, setResetInitialGameState] = useState<
		typeof initialGameState | undefined
	>(undefined);
	const [currentStartFen, setCurrentStartFen] = useState<string>(
		initialGameState?.fen || DEFAULT_FEN
	);
	const [currentPlayerSide, setCurrentPlayerSide] = useState<ColorSide>(
		initialGameState?.playerSide || ColorSide.white
	);
	const [currentStartSide, setCurrentStartSide] = useState<ColorSide>(
		initialGameState?.startSide || ColorSide.white
	);

	const stateRef = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });
	const locationKeyRef = useRef<string | null>(null);

	const init = useCallback(async () => {
		setIsLoading(true);
		setCurrentStartFen(initialGameState?.fen || DEFAULT_FEN);
		setCurrentPlayerSide(initialGameState?.playerSide || ColorSide.white);
		setCurrentStartSide(initialGameState?.startSide || ColorSide.white);
		resetGame();

		const worker = appModule?.getWorker() as Worker | undefined;
		const handleResetMessage = (e: MessageEvent<MessageData | undefined>) => {
			if (e.data?.token === GAME_RESET_TOKEN)
				worker?.removeEventListener("message", handleResetMessage);
		};

		worker?.addEventListener("message", handleResetMessage);
		stateRef.current.isPending = true;

		const _workerThread = await appModule?.getWorkerPool()?.run?.({
			payload: {
				path: aiWorkerLocation,
				subject: {}
			}
		});

		stateRef.current.isPending = false;
		stateRef.current.isReady = !!_workerThread;

		setAiWorker(_workerThread);
		setTimeout(() => setIsLoading(false), 100);
	}, [
		appModule,
		resetGame,
		setIsLoading,
		initialGameState?.playerSide,
		initialGameState?.startSide
	]);

	const dispose = useCallback(() => {
		(aiWorker?.[0] as WorkerThread)?.terminate();

		setAiWorker(undefined);

		stateRef.current.isPending = false;
		stateRef.current.isReady = false;
	}, [aiWorker]);

	const performPieceMove = useCallback(
		(move: Move) => {
			appModule?.getWorker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageData<Move>);
		},
		[appModule]
	);

	useEffect(() => {
		if (
			locationKeyRef.current === location.key ||
			validateFen(`${initialGameState?.fen}`).ok
		)
			return;
		setInitialGameState({ fen: DEFAULT_FEN });
	}, [initialGameState?.fen, location.key, setInitialGameState]);

	useEffect(() => {
		const state = stateRef.current;
		const locationKey = location.key;
		const currentLocationKey = locationKeyRef.current;
		if (
			currentLocationKey !== locationKey &&
			!aiWorker &&
			!state.isPending &&
			!state.isReady
		) {
			locationKeyRef.current = location.key;

			init();
		}

		return () => {
			if (aiWorker && currentLocationKey === locationKey) dispose();
		};
	}, [dispose, init, location.key, aiWorker]);

	useEffect(() => {
		const gameMode = getGameModeFromUrl(searchParams);
		const players: PlayerModel[] = [];

		if (gameMode === GameMode.simulation) {
			const searchedAI1 = searchParams.get("ai1");
			const searchedAI2 = searchParams.get("ai2");
			const ai1Key =
				searchedAI1 !== null && SupportedAiModelKey[searchedAI1]
					? searchedAI1
					: SupportedAiModelKey.zeyu;
			const ai2Key =
				searchedAI2 !== null && SupportedAiModelKey[searchedAI2]
					? SupportedAiModelKey[searchedAI2]
					: SupportedAiModelKey.zeyu;
			const aiPlayer1 = new PlayerModel();
			const aiPlayer2 = new PlayerModel();

			aiPlayer1.setEntity({
				id: SupportedAiModel[ai1Key],
				color: currentPlayerSide
			});
			aiPlayer2.setEntity({
				id: SupportedAiModel[ai2Key],
				color: getOppositeColorSide(currentPlayerSide)
			});
			players.push(aiPlayer1, aiPlayer2);

			if (
				app &&
				aiWorker?.[0]?.thread?.movePerformed$ &&
				!stateRef.current.isPending &&
				stateRef.current.isReady
			)
				setTimeout(() => {
					aiWorker?.[0]?.worker?.postMessage?.({
						token: AI_WILL_PERFORM_MOVE_TOKEN,
						value: {
							fen: currentStartFen,
							ai: (currentStartSide === aiPlayer1.color
								? aiPlayer1.id
								: aiPlayer2.id) as SupportedAiModel
						}
					} satisfies MessageData<{
						fen: string;
						ai: SupportedAiModel;
					}>);
				}, 500);
		} else {
			const searchedAIParam = searchParams.get("ai");
			const aiKey =
				searchedAIParam !== null && SupportedAiModelKey[searchedAIParam]
					? SupportedAiModelKey[searchedAIParam]
					: SupportedAiModelKey.zeyu;
			const aiPlayer = new PlayerModel();

			aiPlayer.setEntity({
				id: SupportedAiModel[aiKey],
				color: getOppositeColorSide(currentPlayerSide)
			});
			players.push(aiPlayer);

			if (
				app &&
				aiWorker?.[0]?.thread?.movePerformed$ &&
				!stateRef.current.isPending &&
				stateRef.current.isReady &&
				currentStartSide === aiPlayer.color
			)
				setTimeout(() => {
					aiWorker?.[0]?.worker?.postMessage?.({
						token: AI_WILL_PERFORM_MOVE_TOKEN,
						value: {
							fen: currentStartFen,
							ai: aiPlayer.id as SupportedAiModelKey
						}
					} satisfies MessageData<{
						fen: string;
						ai: SupportedAiModelKey;
					}>);
				}, 500);
		}

		const handleMessages = (
			payload: MessageEvent<EngineUpdatedMessageData>
		) => {
			if (!payload.data?.token) return;

			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				players.forEach((player) => {
					player.next({
						token: "NOTIFIED",
						value: { ...payload.data.value, entity: player.getEntity() }
					});
				});
		};

		const aiPerformedMoveSubscription: Subscription | undefined =
			aiWorker?.[0]?.thread
				?.movePerformed$()
				?.subscribe((message: MessageData<{ move: Move }>) => {
					const { token, value } = message;

					if (token !== AI_PERFORMED_MOVE_TOKEN || !value) return;

					const { move } = value;

					if (!move || !validateFen(move?.after).ok) return;

					const player = players.find((player) => player.color === move.color);

					player?.next({
						value: { move, entity: player.getEntity() },
						token: "PLACED_PIECE"
					});
				});

		const playersSubscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { turn, fen, move, entity } = value || {};

			if (
				token === "NOTIFIED" &&
				move &&
				fen &&
				entity &&
				entity.color === turn
			)
				aiWorker?.[0]?.worker?.postMessage?.({
					token: AI_WILL_PERFORM_MOVE_TOKEN,
					value: { fen, ai: entity.id as SupportedAiModel }
				} satisfies MessageData<{ fen: string; ai: SupportedAiModel }>);

			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value.move);
		});

		appModule?.getWorker()?.addEventListener("message", handleMessages);

		return () => {
			appModule?.getWorker()?.removeEventListener?.("message", handleMessages);
			aiPerformedMoveSubscription?.unsubscribe?.();
			playersSubscription.unsubscribe();
		};
	}, [
		app,
		appModule,
		currentPlayerSide,
		performPieceMove,
		searchParams,
		aiWorker
	]);

	return null;
};
