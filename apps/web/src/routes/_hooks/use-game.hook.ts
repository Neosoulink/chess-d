import { useCallback, useRef, useState } from "react";
import { Move } from "chess.js";
import { register, RegisterModule } from "@quick-threejs/reactive";

import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../../shared/types";
import { GAME_UPDATED_TOKEN, PIECE_WILL_MOVE_TOKEN } from "../../shared/tokens";
import { PlayerModel } from "../../shared/models";

/** @description Game login worker location. */
const workerLocation = new URL(
	"../../core/game/game.worker.ts",
	import.meta.url
) as unknown as string;

/** @description Provide resources about the chess game and the application logic. */
export const useGame = () => {
	const [app, setApp] = useState<RegisterModule | undefined>();

	const state = useRef<{
		app?: RegisterModule;
		isPending: boolean;
		isReady: boolean;
	}>({ isPending: false, isReady: false });

	const [players, setPlayers] = useState<PlayerModel[]>([]);

	const handleGmeUpdate = useRef<
		| ((payload?: EngineGameUpdatedMessageEventPayload["value"]) => unknown)
		| null
	>();

	const onGameUpdate = useCallback(
		(
			callback: (
				payload: EngineGameUpdatedMessageEventPayload["value"]
			) => unknown
		) => {
			handleGmeUpdate.current = callback;
		},
		[]
	);

	const performPieceMove = useCallback((move: Move) => {
		state.current.app?.worker()?.postMessage?.({
			token: PIECE_WILL_MOVE_TOKEN,
			value: move
		} satisfies MessageEventPayload<Move>);
	}, []);

	const handleMessages = useCallback(
		(payload: MessageEvent<EngineGameUpdatedMessageEventPayload>) => {
			if (!payload.data?.token) return;

			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				handleGmeUpdate.current?.(payload.data.value);
		},
		[]
	);

	const init = useCallback(() => {
		if (state.current.isPending || state.current.isReady) return;
		state.current.isPending = true;

		register({
			location: workerLocation,
			enableDebug: !!import.meta.env?.DEV,
			axesSizes: 5,
			gridSizes: 10,
			withMiniCamera: true,
			onReady: (_app) => {
				_app.worker()?.addEventListener("message", handleMessages);

				state.current.app = _app;
				state.current.isPending = false;
				state.current.isReady = true;

				setApp(_app);
			}
		});
	}, [state, handleMessages]);

	const createPlayer = useCallback(() => {
		const player = new PlayerModel();
		setPlayers((prev) => [...prev, player]);

		return player;
	}, []);

	const removePlayer = useCallback(
		(player: PlayerModel) =>
			setPlayers((prev) =>
				prev.filter((_player) => {
					if (_player !== player) return true;

					_player.unsubscribe();
					_player.complete();

					return false;
				})
			),
		[]
	);

	const dispose = useCallback(() => {
		app?.worker()?.removeEventListener("message", handleMessages);
		app?.dispose();

		state.current.app = undefined;
		state.current.isReady = false;
		state.current.isPending = false;

		setApp(undefined);
	}, [app, handleMessages]);

	return {
		app,
		state: state.current,
		init,
		players,
		createPlayer,
		removePlayer,
		performPieceMove,
		onGameUpdate,
		dispose
	};
};
