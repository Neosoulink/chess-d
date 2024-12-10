import { SupportedAiModel } from "@chess-d/ai";
import { ColorSide } from "@chess-d/shared";
import { RegisterModule } from "@quick-threejs/reactive";
import { Move, validateFen } from "chess.js";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { merge, Subscription } from "rxjs";

import { PlayerModel } from "../../../shared/models";
import {
	AI_PERFORMED_MOVE_TOKEN,
	AI_WILL_PERFORM_MOVE_TOKEN
} from "../../../shared/tokens";
import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../../../shared/types";
import { useGameStore } from "../../_stores";
import {
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";

export interface WithAIComponentProps {}

/** @internal */
const workerLocation = new URL(
	"../../../core/ai/ai.worker.ts",
	import.meta.url
) as unknown as string;

export const WithAIComponent: FC<WithAIComponentProps> = () => {
	const { app } = useGameStore();
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

		const _workerThread = await app?.workerPool()?.run?.({
			payload: {
				path: workerLocation,
				subject: {}
			}
		});

		state.current.isPending = false;
		state.current.isReady = !!_workerThread;

		setWorkerThread(_workerThread);
	}, [app]);

	const dispose = useCallback(() => {
		workerThread?.worker?.terminate();
		workerThread?.thread?.lifecycle$?.();
		setWorkerThread(undefined);

		state.current.isPending = false;
		state.current.isReady = false;
	}, [workerThread]);

	const performPieceMove = useCallback(
		(move: Move) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[app]
	);

	useEffect(() => {
		const _state = state.current;

		if (app && !workerThread && !_state.isPending && !_state.isReady) init();

		return () => {
			if (workerThread && !_state.isPending && _state.isReady) dispose();
		};
	}, [app, dispose, init, workerThread]);

	useEffect(() => {
		const appGui = app?.gui();
		const aiGui = appGui.addFolder("AI Controls");

		const players: PlayerModel[] = [];

		const searchedAIParam = searchParams.get("ai");
		const aiModel =
			searchedAIParam !== null && SupportedAiModel[searchedAIParam]
				? searchedAIParam
				: "zeyu";
		const aiPlayer = new PlayerModel();
		aiPlayer.id = SupportedAiModel[aiModel];
		aiPlayer.color = ColorSide.black;

		players.push(aiPlayer);

		if (import.meta.env?.DEV) {
			const options = { ai: aiModel };
			aiGui
				.add(
					options,
					"ai",
					Object.keys(SupportedAiModel).filter((key) => isNaN(Number(key)))
				)
				.onChange((value) => {
					const aiModel = SupportedAiModel[value];
					aiPlayer.id = aiModel;
				})
				.name("AI Model");
		}

		const handleMessages = (
			payload: MessageEvent<EngineGameUpdatedMessageEventPayload>
		) => {
			if (!payload.data?.token) return;

			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				players.forEach((player) => {
					player.next({
						token: "NOTIFIED",
						value: payload.data.value
					});
				});
		};

		const aimPerformedMoveSubscription: Subscription | undefined =
			workerThread?.thread
				?.movePerformed$()
				?.subscribe((message: MessageEventPayload<{ move: Move }>) => {
					const { token, value } = message;

					if (token !== AI_PERFORMED_MOVE_TOKEN || !value) return;

					const { move } = value;

					if (!move || !validateFen(move?.after).ok) return;

					players
						.find((player) => player.color === move.color)
						?.next({
							value: {
								move
							},
							token: "PLACED_PIECE"
						});
				});

		const playersSubscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { turn, fen, move } = value || {};
			const player = players.find((player) => player.color === turn);

			if (token === "NOTIFIED" && move && fen && player)
				workerThread?.worker?.postMessage?.({
					token: AI_WILL_PERFORM_MOVE_TOKEN,
					value: { fen, ai: player.id as SupportedAiModel }
				} satisfies MessageEventPayload<{ fen: string; ai: SupportedAiModel }>);

			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value?.move);
		});

		app?.worker()?.addEventListener("message", handleMessages);

		return () => {
			app?.worker()?.removeEventListener?.("message", handleMessages);
			aimPerformedMoveSubscription?.unsubscribe?.();
			playersSubscription.unsubscribe();
			aiGui.destroy();
		};
	}, [app, performPieceMove, searchParams, workerThread]);

	return null;
};
