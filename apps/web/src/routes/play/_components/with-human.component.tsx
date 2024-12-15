import {
	ColorSide,
	DEFAULT_FEN,
	GameUpdatedPayload,
	PlayerEntity,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN,
	SOCKET_ROOM_CREATED_TOKEN,
	SocketAuthInterface
} from "@chess-d/shared";
import { Move } from "chess.js";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { merge } from "rxjs";
import { io } from "socket.io-client";

import { PlayerModel } from "../../../shared/models";
import {
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";
import {
	EngineGameUpdatedMessageEventPayload,
	MessageEventPayload
} from "../../../shared/types";
import { useGameStore } from "../../_stores";

/** @internal */
interface RoomJoinedPayload {
	room: { fen: string; players: PlayerEntity[] };
	player: PlayerEntity;
	roomID: string;
}

export interface WithHumanComponentProps {}

export const WithHumanComponent: FC<WithHumanComponentProps> = () => {
	const { app } = useGameStore();
	const socket = useMemo(
		() =>
			io("http://localhost:3000", {
				autoConnect: false
			}),
		[]
	);

	const [searchParams, setSearchParams] = useSearchParams();

	const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>();
	const [opponentPlayer, setOpponentPlayer] = useState<
		PlayerModel | undefined
	>();

	const onRoomCreated = useCallback(
		(data: RoomJoinedPayload) => {
			console.log("Room created:", data);

			const player = new PlayerModel();
			player.setEntity(data.player);

			setCurrentPlayer(player);
			setSearchParams((prev) => [...prev, ["roomID", data.roomID]]);
		},
		[setSearchParams]
	);

	const onJoinedRoom = useCallback(
		(data: RoomJoinedPayload) => {
			const player = new PlayerModel();
			player.setEntity(data.player);

			if (!currentPlayer) {
				const [opponentEntity] = data.room.players;

				if (opponentEntity) {
					const opponent = new PlayerModel();
					opponent.setEntity(opponentEntity);

					setOpponentPlayer(opponent);
				}

				setCurrentPlayer(player);
			} else {
				currentPlayer.host = true;
				setOpponentPlayer(player);
			}

			console.log("Joined room:", data);
		},
		[currentPlayer]
	);

	const onDisconnect = useCallback(() => {
		console.log("Disconnected from server.");
	}, []);

	const onError = useCallback(
		(error: Error) => {
			console.warn("Socket error:", error);

			if (error.cause === "ROOM_NOT_FOUND") {
				setSearchParams((prev) =>
					[...prev].filter(([key]) => key !== "roomID")
				);
				socket.auth = { ...socket.auth, roomID: undefined };
			}

			setTimeout(() => socket.connect(), 1000);
		},
		[setSearchParams, socket]
	);

	const onMovePerformed = useCallback(
		(data: GameUpdatedPayload) => {
			opponentPlayer?.next({ token: "PLACED_PIECE", value: data });
			console.log("Opponent performed move:", data);
		},
		[opponentPlayer]
	);

	const moveBoardPiece = useCallback(
		(move: Move) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[app]
	);

	useEffect(() => {
		socket.on(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
		socket.on(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
		socket.on(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
		socket.on("disconnect", onDisconnect);
		socket.on("error", onError);

		socket.auth = {
			roomID: searchParams.get("roomID"),
			side: ColorSide.black,
			fen: DEFAULT_FEN
		} satisfies SocketAuthInterface;

		socket.connect();

		return () => {
			socket.off(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
			socket.off(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
			socket.off(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
			socket.off("disconnect", onDisconnect);
			socket.off("error", onError);
		};
	}, [
		onDisconnect,
		onError,
		onJoinedRoom,
		onMovePerformed,
		onRoomCreated,
		searchParams,
		socket
	]);

	useEffect(() => {
		const players: PlayerModel[] = [];

		if (currentPlayer) players.push(currentPlayer);
		if (opponentPlayer) players.push(opponentPlayer);

		const subscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { turn, fen, move, entity } = value || {};

			if (
				token === "NOTIFIED" &&
				move &&
				fen &&
				fen !== move.before &&
				entity &&
				entity.color === turn
			) {
				console.log("Player notified:", value);
				socket.emit(SOCKET_MOVE_PERFORMED_TOKEN, value);
			}
			if (payload.token === "PLACED_PIECE" && payload.value?.move)
				return moveBoardPiece(payload.value?.move);
		});

		const handleMessages = (
			payload: MessageEvent<EngineGameUpdatedMessageEventPayload>
		) => {
			if (!payload.data?.token) return;

			console.log("Received message:", payload.data);
			if (payload.data.token === GAME_UPDATED_TOKEN && payload.data?.value?.fen)
				players.forEach((player) => {
					player.next({
						token: "NOTIFIED",
						value: { ...payload.data.value, entity: player.getEntity() }
					});
				});
		};

		app?.worker()?.addEventListener("message", handleMessages);

		return () => {
			subscription.unsubscribe();
			app?.worker?.().removeEventListener("message", handleMessages);
		};
	}, [app, currentPlayer, opponentPlayer, moveBoardPiece, socket]);

	return null;
};
