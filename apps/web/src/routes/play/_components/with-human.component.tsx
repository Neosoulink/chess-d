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
	GAME_WILL_RESET_TOKEN,
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

	const moveBoardPiece = useCallback(
		(move: Move) => {
			app?.worker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageEventPayload<Move>);
		},
		[app]
	);

	const resetBoardPieces = useCallback(
		(fen?: string) => {
			setTimeout(() => {
				app?.worker()?.postMessage?.({
					token: GAME_WILL_RESET_TOKEN,
					value: { fen }
				} satisfies MessageEventPayload<{ fen }>);
			}, 100);
		},
		[app]
	);

	const onRoomCreated = useCallback(
		(data: RoomJoinedPayload) => {
			console.log("Room created:", data);

			const player = new PlayerModel();
			player.setEntity(data.player);

			socket.auth = {
				...socket.auth,
				roomID: data.roomID,
				side: player.color,
				fen: data.room.fen
			};

			setCurrentPlayer(player);
			setSearchParams((prev) => [...prev, ["roomID", data.roomID]]);
			resetBoardPieces(data.room.fen);
		},
		[resetBoardPieces, setSearchParams, socket]
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
				socket.auth = {
					...socket.auth,
					roomID: data.roomID,
					side: player.color,
					fen: data.room.fen
				};
			} else {
				currentPlayer.host = true;
				setOpponentPlayer(player);
			}

			resetBoardPieces(data.room.fen);
			console.log("Joined room:", data);
		},
		[currentPlayer, resetBoardPieces, socket]
	);

	const onDisconnect = useCallback(() => {
		console.log("Disconnected from server.");

		setCurrentPlayer(undefined);
		setOpponentPlayer(undefined);
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
			opponentPlayer?.next({
				token: "PLACED_PIECE",
				value: { ...data, entity: opponentPlayer.getEntity() }
			});
			console.log("Opponent performed move:", data);
		},
		[opponentPlayer]
	);

	useEffect(() => {
		socket.on(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
		socket.on(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
		socket.on(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
		socket.on("disconnect", onDisconnect);
		socket.on("error", onError);

		if (!socket.connected) {
			socket.auth = {
				roomID: searchParams.get("roomID"),
				side: ColorSide.white,
				fen: DEFAULT_FEN
			} satisfies SocketAuthInterface;

			socket.connect();
		}

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

			if (!move || !fen) return;

			if (
				token === "NOTIFIED" &&
				turn &&
				fen !== move.before &&
				entity?.color === move.color &&
				currentPlayer?.color === move.color
			) {
				console.log("Player notified:", value);
				socket.emit(SOCKET_MOVE_PERFORMED_TOKEN, value);
			}

			if (payload.token === "PLACED_PIECE" && move) return moveBoardPiece(move);
		});

		const handleMessages = (
			payload: MessageEvent<EngineGameUpdatedMessageEventPayload>
		) => {
			const { token, value } = payload.data;
			const { fen } = value || {};

			if (!fen || !token) return;

			console.log("Received message:", payload.data);
			if (token === GAME_UPDATED_TOKEN)
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

	useEffect(() => {
		return () => {
			socket.disconnect();
		};
	}, [socket]);

	return null;
};
