import { RegisterModule } from "@quick-threejs/reactive";
import { WorkerThread } from "@quick-threejs/worker";
import { Move } from "chess.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { getGameModeFromUrl } from "@/shared/utils";
import { GameMode } from "@/shared/enum";
import { useAudioStore, useGameStore } from "@/router/_stores";
import { Icon } from "@/router/_components/core";
import { GameOverviewButton } from "./button";
import { Subscription } from "rxjs";
import {
	AI_WILL_PERFORM_MOVE_TOKEN,
	CHESSBOARD_WILL_HINT_MARKER_TOKEN
} from "@/shared/tokens";
import { SupportedAiModel } from "@chess-d/ai";
import { AiWillPerformMovePayload, MessageData } from "@/shared/types";
import { DEFAULT_FEN } from "@chess-d/shared";

/** @internal */
const aiWorkerLocation = new URL(
	import.meta.env?.DEV
		? "../../../../../core/ai/ai.worker.ts"
		: "./ai-worker.js",
	import.meta.url
) as unknown as string;

export const GameOverviewHintButton: FC = () => {
	const { app, gameState } = useGameStore();
	const { tracks } = useAudioStore();
	const [searchParams] = useSearchParams();

	const [aiWorker, setAiWorker] = useState<
		| Awaited<ReturnType<ReturnType<RegisterModule["getWorkerPool"]>["run"]>>
		| undefined
	>();

	const gameMode = useMemo(
		() => getGameModeFromUrl(searchParams),
		[searchParams]
	);

	const stateRef = useRef<{
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const initHintAi = useCallback(async () => {
		stateRef.current.isPending = true;

		const workerPool = app?.module?.getWorkerPool?.();

		const _workerThread = await workerPool?.run?.({
			payload: {
				path: aiWorkerLocation,
				subject: {}
			}
		});

		stateRef.current.isPending = false;
		stateRef.current.isReady = !!_workerThread;

		setAiWorker(_workerThread);
	}, [app?.module]);

	const disposeHintAi = useCallback(() => {
		(aiWorker?.[0] as WorkerThread | undefined)?.terminate();

		setAiWorker(undefined);

		stateRef.current.isPending = false;
		stateRef.current.isReady = false;
	}, [aiWorker]);

	const getHint = useCallback(() => {
		const { fen, playerSide, turn, isGameOver } = gameState || {};
		if (isGameOver || (playerSide !== turn && gameMode !== GameMode.free))
			return;

		aiWorker?.[0]?.worker?.postMessage?.({
			token: AI_WILL_PERFORM_MOVE_TOKEN,
			value: {
				ai: SupportedAiModel.basicBot,
				fen: fen || DEFAULT_FEN,
				registerOptions: { depth: 2 }
			}
		} satisfies MessageData<AiWillPerformMovePayload>);
	}, [aiWorker, gameState?.fen, gameState?.playerSide, gameState?.turn]);

	useEffect(() => {
		const state = stateRef.current;
		if (!aiWorker && !state.isPending && !state.isReady) initHintAi();

		return () => aiWorker && disposeHintAi();
	}, [initHintAi, disposeHintAi]);

	useEffect(() => {
		let subscription: Subscription | undefined;

		if (typeof aiWorker?.[0]?.thread?.movePerformed$ === "function")
			subscription = aiWorker?.[0]?.thread
				?.movePerformed$()
				?.subscribe(({ value }: MessageData<{ move: Move }>) => {
					const appWorker = app?.module?.getWorkerThread()?.worker as
						| Worker
						| undefined;

					tracks["sfx-game-hint"]?.audio?.stop();
					tracks["sfx-game-hint"]?.audio?.play();

					appWorker?.postMessage?.({
						token: CHESSBOARD_WILL_HINT_MARKER_TOKEN,
						value
					} satisfies MessageData<any>);
				});

		return () => subscription?.unsubscribe();
	}, [aiWorker, tracks]);

	return (
		<GameOverviewButton onClick={getHint}>
			<Icon.Hint />
		</GameOverviewButton>
	);
};
