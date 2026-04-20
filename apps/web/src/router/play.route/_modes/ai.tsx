import {
	AiRegisterOptions,
	SupportedAiModel,
	SupportedAiModelKey
} from "@chess-d/ai";
import { ColorSide, DEFAULT_FEN, getOppositeColorSide } from "@chess-d/shared";
import { RegisterModule } from "@quick-threejs/reactive";
import { WorkerThread } from "@quick-threejs/worker";
import { Move, validateFen } from "chess.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { merge, Subscription } from "rxjs";

import { GameMode } from "@/shared/enum";
import { PlayerModel } from "@/shared/models";
import {
	AiWillPerformMovePayload,
	EngineUpdatedMessageData,
	MessageData
} from "@/shared/types";
import {
	AI_PERFORMED_MOVE_TOKEN,
	AI_WILL_PERFORM_MOVE_TOKEN,
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "@/shared/tokens";
import { getGameModeFromUrl } from "@/shared/utils";
import {
	useGameStore,
	useLoaderStore,
	useMainMenuStore
} from "@/router/_stores";

export interface PlayModeAIProps {}

/** @internal */
const devMode = import.meta.env?.DEV;

/** @internal */
const aiWorkerLocation = new URL(
	devMode ? "../../../core/ai/ai.worker.ts" : "./ai-worker.js",
	import.meta.url
) as unknown as string;

export const PlayModeAI: FC<PlayModeAIProps> = () => {
	const {
		app,
		isGameAIPaused,
		initialGameState,
		resetGame,
		setInitialGameState,
		setIsGameAIPaused
	} = useGameStore();
	const { isOpen: isMainMenuOpen } = useMainMenuStore();
	const { setIsLoading } = useLoaderStore();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const { module: appModule } = app ?? {};

	const [aiWorker, setAiWorker] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["getWorkerPool"]>["run"]>>
		| undefined
	>();
	const [currentStartFen, setCurrentStartFen] = useState<string>(
		initialGameState?.fen || DEFAULT_FEN
	);
	const [currentPlayerSide, setCurrentPlayerSide] = useState<ColorSide>(
		initialGameState?.playerSide || ColorSide.white
	);
	const [currentStartSide, setCurrentStartSide] = useState<ColorSide>(
		initialGameState?.startSide || ColorSide.white
	);

	const stateRef = useRef({ isPending: false, isReady: false });
	const locationKeyRef = useRef<string | null>(null);
	const isGameAIPausedRef = useRef(isGameAIPaused);
	const pendingAiMoveRef = useRef<AiWillPerformMovePayload | null>(null);

	isGameAIPausedRef.current = isGameAIPaused;

	const init = useCallback(async () => {
		setIsLoading(true);
		setCurrentStartFen(initialGameState?.fen || DEFAULT_FEN);
		setCurrentPlayerSide(initialGameState?.playerSide || ColorSide.white);
		setCurrentStartSide(initialGameState?.startSide || ColorSide.white);
		resetGame();

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
		pendingAiMoveRef.current = null;
	}, [aiWorker]);

	const performPieceMove = useCallback(
		(move: Move) => {
			appModule?.getWorkerThread()?.worker?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageData<Move>);
		},
		[appModule]
	);

	const wrapRegisterOptions = useCallback(
		(options?: Partial<AiRegisterOptions>): AiRegisterOptions => {
			const envBaseUrl = import.meta.env.PUBLIC_SERVER_HOST?.replace(/\/$/, "");

			return {
				...options,
				proxyBaseUrl: options?.proxyBaseUrl ?? envBaseUrl ?? ""
			};
		},
		[]
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

		const postAiWillPerformMove = (value: AiWillPerformMovePayload) => {
			const worker = aiWorker?.[0]?.worker;
			if (!worker) return;

			if (isGameAIPausedRef.current) {
				pendingAiMoveRef.current = value;
				return;
			}

			pendingAiMoveRef.current = null;
			worker.postMessage({
				token: AI_WILL_PERFORM_MOVE_TOKEN,
				value
			} satisfies MessageData<AiWillPerformMovePayload>);
		};

		let initialAiMoveTimeout: ReturnType<typeof setTimeout> | undefined;

		if (gameMode === GameMode.simulation) {
			const searchedAI1 = searchParams.get("ai1");
			const searchedAI2 = searchParams.get("ai2");
			const searchedDepth1 = isNaN(Number(searchParams.get("depth1")))
				? undefined
				: Number(searchParams.get("depth1"));
			const searchedDepth2 = isNaN(Number(searchParams.get("depth2")))
				? undefined
				: Number(searchParams.get("depth2"));
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
			aiPlayer1.depth = searchedDepth1;
			aiPlayer2.setEntity({
				id: SupportedAiModel[ai2Key],
				color: getOppositeColorSide(currentPlayerSide)
			});
			aiPlayer2.depth = searchedDepth2;

			players.push(aiPlayer1, aiPlayer2);

			if (
				app &&
				aiWorker?.[0]?.thread?.movePerformed$ &&
				!stateRef.current.isPending &&
				stateRef.current.isReady
			)
				initialAiMoveTimeout = setTimeout(() => {
					postAiWillPerformMove({
						fen: currentStartFen,
						ai: (currentStartSide === aiPlayer1.color
							? aiPlayer1.id
							: aiPlayer2.id) as SupportedAiModel,
						registerOptions: wrapRegisterOptions({
							depth:
								currentStartSide === aiPlayer1.color
									? aiPlayer1.depth
									: aiPlayer2.depth
						})
					});
				}, 1500);
		} else {
			const searchedAIParam = searchParams.get("ai");
			const searchedDepthParam = isNaN(Number(searchParams.get("depth")))
				? undefined
				: Number(searchParams.get("depth"));
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
				initialAiMoveTimeout = setTimeout(() => {
					postAiWillPerformMove({
						fen: currentStartFen,
						ai: aiPlayer.id as SupportedAiModel,
						registerOptions: wrapRegisterOptions({
							depth: searchedDepthParam
						})
					});
				}, 1500);
		}

		const handleMessages = (
			payload: MessageEvent<EngineUpdatedMessageData>
		) => {
			if (!payload.data?.token) return;

			if (
				payload.data.token !== GAME_UPDATED_TOKEN ||
				!payload.data?.value?.fen
			)
				return;

			if (gameMode !== GameMode.simulation) {
				isGameAIPausedRef.current = false;
				setIsGameAIPaused(false);
			}

			players.forEach((player) => {
				player.next({
					token: "NOTIFIED",
					value: {
						...payload.data.value,
						entity: player.getEntity(),
						depth: player.depth
					}
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
						value: { move, entity: player.getEntity(), depth: player.depth },
						token: "PLACED_PIECE"
					});
				});

		const playersSubscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { turn, fen, move, entity, depth, isGameOver } = value || {};

			if (
				!isGameOver &&
				token === "NOTIFIED" &&
				move &&
				fen &&
				entity &&
				entity.color === turn
			)
				postAiWillPerformMove({
					fen,
					ai: entity.id as SupportedAiModel,
					registerOptions: wrapRegisterOptions({ depth })
				});

			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value.move);
		});
		const appWorker = appModule?.getWorkerThread()?.worker as
			| Worker
			| undefined;

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			if (initialAiMoveTimeout) clearTimeout(initialAiMoveTimeout);
			pendingAiMoveRef.current = null;
			appWorker?.removeEventListener?.("message", handleMessages);
			aiPerformedMoveSubscription?.unsubscribe?.();
			playersSubscription.unsubscribe();
		};
	}, [
		app,
		appModule,
		currentPlayerSide,
		performPieceMove,
		searchParams,
		setIsGameAIPaused,
		aiWorker
	]);

	useEffect(() => {
		if (isMainMenuOpen) setIsGameAIPaused(true);
	}, [isMainMenuOpen, setIsGameAIPaused]);

	useEffect(() => {
		if (isGameAIPaused) return;
		if (!stateRef.current.isReady) return;

		const worker = aiWorker?.[0]?.worker as Worker | undefined;
		if (!worker) return;

		const pending = pendingAiMoveRef.current;
		if (!pending) return;

		pendingAiMoveRef.current = null;
		worker.postMessage({
			token: AI_WILL_PERFORM_MOVE_TOKEN,
			value: pending
		} satisfies MessageData<AiWillPerformMovePayload>);
	}, [isGameAIPaused, aiWorker]);

	return null;
};
