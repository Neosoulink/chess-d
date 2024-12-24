import { SupportedAiModel } from "@chess-d/ai";
import { ColorSide, DEFAULT_FEN } from "@chess-d/shared";
import { RegisterModule } from "@quick-threejs/reactive";
import { Move, validateFen } from "chess.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { merge, Subscription } from "rxjs";

import { GameMode } from "../../../shared/enum";
import { PlayerModel } from "../../../shared/models";
import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../../../shared/types";
import {
	AI_PERFORMED_MOVE_TOKEN,
	AI_WILL_PERFORM_MOVE_TOKEN,
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";
import { getGameModeFromUrl } from "../../../shared/utils";
import { useGameStore } from "../../_stores";

export interface WithAIComponentProps {}

/** @internal */
const workerLocation = new URL(
	"../../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

export const WithAIComponent: FC<WithAIComponentProps> = () => {
	const { app } = useGameStore();
	const { module: appModule } = app ?? {};
	const [searchParams] = useSearchParams();

	const state = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const [workerThread, setWorkerThread] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["workerPool"]>["run"]>>
		| undefined
	>();

	const init = useCallback(async () => {
		state.current.isPending = true;

		const _workerThread = await appModule?.workerPool()?.run?.({
			payload: {
				path: workerLocation,
				subject: {}
			}
		});

		state.current.isPending = false;
		state.current.isReady = !!_workerThread;

		setWorkerThread(_workerThread);
	}, [appModule]);

	const dispose = useCallback(() => {
		workerThread?.[0]?.worker?.terminate();
		workerThread?.[0]?.thread?.lifecycle$?.();
		setWorkerThread(undefined);

		state.current.isPending = false;
		state.current.isReady = false;
	}, [workerThread]);

	const performPieceMove = useCallback(
		(move: Move) => {
			appModule?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[appModule]
	);

	useEffect(() => {
		const _state = state.current;

		if (app && !workerThread && !_state.isPending && !_state.isReady) init();

		return () => {
			if (workerThread && !_state.isPending && _state.isReady) dispose();
		};
	}, [app, dispose, init, workerThread]);

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
				!state.current.isPending &&
				state.current.isReady
			)
				setTimeout(() => {
					workerThread?.[0]?.worker?.postMessage?.({
						token: AI_WILL_PERFORM_MOVE_TOKEN,
						value: { fen: DEFAULT_FEN, ai: aiPlayer1.id as SupportedAiModel }
					} satisfies MessageEventPayload<{
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
			payload: MessageEvent<EngineGameUpdatedMessageEventPayload>
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
				?.subscribe((message: MessageEventPayload<{ move: Move }>) => {
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
				} satisfies MessageEventPayload<{ fen: string; ai: SupportedAiModel }>);

			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value.move);
		});

		appModule?.worker()?.addEventListener("message", handleMessages);

		return () => {
			appModule?.worker()?.removeEventListener?.("message", handleMessages);
			aimPerformedMoveSubscription?.unsubscribe?.();
			playersSubscription.unsubscribe();
		};
	}, [app, appModule, performPieceMove, searchParams, workerThread]);

	return null;
};
