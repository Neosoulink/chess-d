import { Move } from "chess.js";
import { FC, Fragment, useCallback, useEffect } from "react";
import { merge } from "rxjs";

import { useGameStore } from "../../_stores";
import { PlayerModel } from "../../../shared/models";
import {
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";
import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../../../shared/types";
import { ColorSide, PlayerEntity } from "@chess-d/shared";

export const FreeModeComponent: FC = () => {
	const { app } = useGameStore();
	const { module: appModule } = app ?? {};

	const performPieceMove = useCallback(
		(move: Move) => {
			appModule?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[appModule]
	);

	const createPlayer = useCallback((identity: PlayerEntity) => {
		const player = new PlayerModel();
		player.color = identity.color;

		return player;
	}, []);

	useEffect(() => {
		const _players = [
			createPlayer({ color: ColorSide.white }),
			createPlayer({ color: ColorSide.black })
		];

		const handleMessages = (
			payload: MessageEvent<EngineGameUpdatedMessageEventPayload>
		) => {
			if (!payload.data?.token) return;

			if (
				payload.data.token === GAME_UPDATED_TOKEN &&
				payload.data?.value?.fen
			) {
				_players.forEach((player) => {
					player.next({
						token: "NOTIFIED",
						value: payload.data.value
					});
				});
			}
		};

		const playersSubscription = merge(..._players).subscribe((payload) => {
			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return performPieceMove(payload.value?.move);
		});

		appModule?.worker()?.addEventListener("message", handleMessages);

		return () => {
			playersSubscription.unsubscribe();
			_players.forEach((player) => {
				player.complete();
				player.unsubscribe();
				_players.shift();
			});
			appModule?.worker()?.removeEventListener("message", handleMessages);
		};
	}, [app, appModule, createPlayer, performPieceMove]);

	return <Fragment />;
};
