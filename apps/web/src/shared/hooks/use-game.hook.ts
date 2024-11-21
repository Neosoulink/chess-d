import { useCallback, useMemo, useRef, useState } from "react";
import { Chess, Color } from "chess.js";
import { register, RegisterModule } from "@quick-threejs/reactive";

import { MessageEventPayload, MoveLike } from "../types";
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

	const gameUpdatedCall = useRef<
		| ((payload?: { turn: Color; fen: string; move?: MoveLike }) => unknown)
		| null
	>();

	const gameUpdatedCallbackRegister = useCallback(
		(
			callback: (
				payload: Parameters<NonNullable<(typeof gameUpdatedCall)["current"]>>[0]
			) => unknown
		) => {
			gameUpdatedCall.current = callback;
		},
		[]
	);
	const handleMessages = useCallback(
		(
			payload: MessageEvent<
				MessageEventPayload<
					Parameters<NonNullable<(typeof gameUpdatedCall)["current"]>>[0]
				>
			>
		) => {
			if (!payload.data?.token) return;

			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				gameUpdatedCall.current?.(payload.data.value);
		},
		[]
	);

	const movePiece = useCallback(
		(move: MoveLike) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<MoveLike>);
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
