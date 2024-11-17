import { useCallback, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { register, RegisterModule } from "@quick-threejs/reactive";
import { MessageEventPayload } from "../types";
import { GAME_UPDATED_TOKEN } from "../tokens";

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

	const gameUpdatedCall = useRef<((fen: string) => unknown) | null>();

	const gameUpdatedCallbackRegister = useCallback(
		(callback: (fen: string) => unknown) => {
			gameUpdatedCall.current = callback;
		},
		[]
	);
	const handleMessages = useCallback(
		(message: MessageEvent<MessageEventPayload<{ fen?: string }>>) => {
			if (!message.data?.token) return;

			if (message.data.token === GAME_UPDATED_TOKEN && message.data?.value?.fen)
				gameUpdatedCall.current?.(message.data.value.fen);
		},
		[]
	);

	const setup = useCallback(
		() =>
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
			}),
		[handleMessages]
	);

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
		dispose,
		gameUpdatedCallbackRegister
	};
};
