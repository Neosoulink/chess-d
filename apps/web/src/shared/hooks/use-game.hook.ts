import { useCallback, useMemo, useRef, useState } from "react";
import { Chess, Color, Move } from "chess.js";
import { register, RegisterModule } from "@quick-threejs/reactive";

import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../types";
import { GAME_UPDATED_TOKEN, PIECE_WILL_MOVE_TOKEN } from "../tokens";

/** @description Game login worker location. */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useGame = () => {
	const game = useMemo(() => new Chess(), []);

	const [app, setApp] = useState<RegisterModule | undefined>();
	const [isAppReady, setIsAppReady] = useState(false);

	const gameUpdatedCallback = useRef<
		| ((payload?: EngineGameUpdatedMessageEventPayload["value"]) => unknown)
		| null
	>();

	const gameUpdatedCallbackRegister = useCallback(
		(
			callback: (
				payload: EngineGameUpdatedMessageEventPayload["value"]
			) => unknown
		) => {
			gameUpdatedCallback.current = callback;
		},
		[]
	);
	const handleMessages = useCallback(
		(payload: MessageEvent<EngineGameUpdatedMessageEventPayload>) => {
			if (!payload.data?.token) return;

			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				gameUpdatedCallback.current?.(payload.data.value);
		},
		[]
	);

	const movePiece = useCallback(
		(move: Move) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[app]
	);

	const setup = useCallback(() => {
		if (app) return;

		register({
			location: workerLocation,
			enableDebug: !!import.meta.env?.DEV,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			onReady: (_app) => {
				setApp(_app);
				setIsAppReady(true);

				_app.worker()?.addEventListener("message", handleMessages);
			}
		});
	}, [app, handleMessages]);

	const dispose = useCallback(() => {
		app?.dispose();
		app?.worker()?.removeEventListener("message", handleMessages);
	}, [app, handleMessages]);

	return {
		game,
		app,
		workerLocation,
		isAppReady,
		setup,
		movePiece,
		dispose,
		gameUpdatedCallbackRegister
	};
};
