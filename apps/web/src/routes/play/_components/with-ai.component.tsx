import { SupportedAiModel } from "@chess-d/ai";
import { ColorSide, DEFAULT_FEN } from "@chess-d/shared";
import { RegisterModule } from "@quick-threejs/reactive";
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
import { WorkerThread } from "@quick-threejs/utils";

export interface WithAIComponentProps {}

/** @internal */
const workerLocation = new URL(
	"../../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

export const WithAIComponent: FC<WithAIComponentProps> = () => {
	const { app, fen, resetGame, setFen } = useGameStore();
	const { setIsLoading } = useLoaderStore();
	const location = useLocation();
	const { module: appModule } = app ?? {};
	const [searchParams] = useSearchParams();

	const stateRef = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const locationKeyRef = useRef<string | null>(null);

	const [workerThread, setWorkerThread] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["getWorkerPool"]>["run"]>>
		| undefined
	>();

	const init = useCallback(async () => {
		setIsLoading(true);
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
				path: workerLocation,
				subject: {}
			}
		});

		stateRef.current.isPending = false;
		stateRef.current.isReady = !!_workerThread;

		setWorkerThread(_workerThread);
		setTimeout(() => setIsLoading(false), 100);
	}, [appModule, resetGame, setIsLoading]);

	const dispose = useCallback(() => {
		(workerThread?.[0] as WorkerThread)?.terminate();

		setWorkerThread(undefined);

		stateRef.current.isPending = false;
		stateRef.current.isReady = false;
	}, [workerThread]);

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
		if (locationKeyRef.current === location.key || validateFen(`${fen}`).ok)
			return;
		setFen(DEFAULT_FEN);
	}, [fen, location.key, setFen]);

	useEffect(() => {
		const state = stateRef.current;
		const locationKey = location.key;
		const currentLocationKey = locationKeyRef.current;
		if (
			currentLocationKey !== locationKey &&
			!workerThread &&
			!state.isPending &&
			!state.isReady
		) {
			locationKeyRef.current = location.key;

			init();
		}

		return () => {
			if (workerThread && currentLocationKey === locationKey) dispose();
		};
	}, [dispose, init, location.key, workerThread]);

	useEffect(() => {
		const gameMode = getGameModeFromUrl(searchParams);
		const players: PlayerModel[] = [];

		if (gameMode === GameMode.simulation) {
			const searchedAI1 = searchParams.get("ai1");
			const searchedAI2 = searchParams.get("ai2");
			const ai1Model =
				searchedAI1 !== null && SupportedAiModel[searchedAI1]
					? searchedAI1
					: "zeyu";
			const ai2Model =
				searchedAI2 !== null && SupportedAiModel[searchedAI2]
					? searchedAI2
					: "zeyu";
			const aiPlayer1 = new PlayerModel();
			aiPlayer1.setEntity({
				id: SupportedAiModel[ai1Model],
				color: ColorSide.white
			});

			const aiPlayer2 = new PlayerModel();
			aiPlayer2.setEntity({
				id: SupportedAiModel[ai2Model],
				color: ColorSide.black
			});

			players.push(aiPlayer1, aiPlayer2);

			if (
				app &&
				workerThread?.[0]?.thread?.movePerformed$ &&
				!stateRef.current.isPending &&
				stateRef.current.isReady
			)
				setTimeout(() => {
					workerThread?.[0]?.worker?.postMessage?.({
						token: AI_WILL_PERFORM_MOVE_TOKEN,
						value: { fen: DEFAULT_FEN, ai: aiPlayer1.id as SupportedAiModel }
					} satisfies MessageData<{
						fen: string;
						ai: SupportedAiModel;
					}>);
				}, 0);
		} else {
			const searchedAIParam = searchParams.get("ai");
			const aiModel =
				searchedAIParam !== null && SupportedAiModel[searchedAIParam]
					? searchedAIParam
					: "zeyu";
			const aiPlayer = new PlayerModel();
			aiPlayer.id = SupportedAiModel[aiModel];
			aiPlayer.color = ColorSide.black;

			players.push(aiPlayer);
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

		const aimPerformedMoveSubscription: Subscription | undefined =
			workerThread?.[0]?.thread
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
				workerThread?.[0]?.worker?.postMessage?.({
					token: AI_WILL_PERFORM_MOVE_TOKEN,
					value: { fen, ai: entity.id as SupportedAiModel }
				} satisfies MessageData<{ fen: string; ai: SupportedAiModel }>);

			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value.move);
		});

		appModule?.getWorker()?.addEventListener("message", handleMessages);

		return () => {
			appModule?.getWorker()?.removeEventListener?.("message", handleMessages);
			aimPerformedMoveSubscription?.unsubscribe?.();
			playersSubscription.unsubscribe();
		};
	}, [app, appModule, performPieceMove, searchParams, workerThread]);

	return null;
};
