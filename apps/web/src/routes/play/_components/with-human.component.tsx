import { Move } from "chess.js";
import { FC, useEffect } from "react";
import { merge, Subscription } from "rxjs";

import { PlayerModel } from "../../../shared/models";
import { EngineGameUpdatedMessageEventPayload } from "../../../shared/types";
import { useSocket } from "../../_hooks";

export interface WithHumanComponentProps {
	performPieceMove: (move: Move) => void;
	onGameUpdate: (
		callback: (
			payload: EngineGameUpdatedMessageEventPayload["value"]
		) => unknown
	) => void;
}

export const WithHumanComponent: FC<WithHumanComponentProps> = ({
	performPieceMove,
	onGameUpdate
}) => {
	const {
		init: initSocket,
		currentPlayer: currentSocketPlayer,
		opponentPlayer: opponentSocketPlayer
	} = useSocket();

	useEffect(() => {
		initSocket();

		return () => {};
	}, [initSocket]);

	useEffect(() => {
		const players: PlayerModel[] = [];

		if (currentSocketPlayer) players.push(currentSocketPlayer);
		if (opponentSocketPlayer) players.push(opponentSocketPlayer);

		const playersSubscription: Subscription = merge(...players).subscribe(
			(payload) => {
				if (payload.token === "PLACED_PIECE" && payload.value?.move)
					return performPieceMove(payload.value?.move);
			}
		);

		onGameUpdate((payload) => {
			console.log("Game updated", payload);

			players.forEach((player) => {
				player?.next({
					token: "NOTIFIED",
					value: payload
				});
			});
		});

		return () => playersSubscription.unsubscribe();
	}, [
		currentSocketPlayer,
		onGameUpdate,
		opponentSocketPlayer,
		performPieceMove
	]);

	return null;
};
