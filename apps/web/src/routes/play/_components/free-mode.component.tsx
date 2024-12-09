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

	const performPieceMove = useCallback(
		(move: Move) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[app]
	);

	const createPlayer = useCallback((identity: PlayerEntity) => {
		const player = new PlayerModel();
		player.color = identity.color as ColorSide;

		return player;
	}, []);

	useEffect(() => {
		const appGui = app?.gui();
		const guiFreeMode = appGui.addFolder("Free Mode");

		const _players = [
			createPlayer({ color: ColorSide.white }),
			createPlayer({ color: ColorSide.black })
		];

		if (import.meta.env?.DEV) {
			const guiPlayer1 = guiFreeMode.addFolder("Player 1");
			const player1Positions = { piece: "p", from: "a2", to: "a3" };
			guiPlayer1.add(player1Positions, "piece");
			guiPlayer1.add(player1Positions, "from");
			guiPlayer1.add(player1Positions, "to");
			guiPlayer1.add(
				{
					"Perform Move": () => {
						const move = {
							color: _players[0]?.color,
							from: player1Positions.from,
							to: player1Positions.to,
							piece: player1Positions.piece
						} as Move;

						_players[0]?.next({
							token: "PLACED_PIECE",
							value: { move }
						});
					}
				},
				"Perform Move"
			);

			const guiPlayer2 = guiFreeMode.addFolder("Player 2");
			const player2Positions = { piece: "p", from: "a7", to: "a6" };
			guiPlayer2.add(player2Positions, "piece");
			guiPlayer2.add(player2Positions, "from");
			guiPlayer2.add(player2Positions, "to");
			guiPlayer2.add(
				{
					"Perform Move": () => {
						const move = {
							color: _players[1]?.color,
							from: player2Positions.from,
							to: player2Positions.to,
							piece: player2Positions.piece
						} as Move;

						_players[1]?.next({
							token: "PLACED_PIECE",
							value: { move }
						});
					}
				},
				"Perform Move"
			);
		}

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

		app?.worker()?.addEventListener("message", handleMessages);

		return () => {
			playersSubscription.unsubscribe();
			_players.forEach((player) => {
				player.complete();
				player.unsubscribe();
				_players.shift();
			});
			app?.worker()?.removeEventListener("message", handleMessages);
			guiFreeMode.destroy();
		};
	}, [app, createPlayer, performPieceMove]);

	return <Fragment />;
};
