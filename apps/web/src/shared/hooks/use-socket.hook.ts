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
import { validateFen } from "chess.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { merge } from "rxjs";
import { io, Socket } from "socket.io-client";

import { PlayerModel } from "../models";

/** @internal */
interface UseSocketReturnType {
	socket: Socket;
	currentPlayer?: PlayerModel;
	opponentPlayer?: PlayerModel;
	init: (props?: { roomID?: string; side?: ColorSide; fen?: string }) => void;
}

/** @internal */
interface RoomJoinedPayload {
	room: { fen: string; players: PlayerEntity[] };
	player: PlayerEntity;
	roomID: string;
}

export const useSocket = (): UseSocketReturnType => {
	const [searchParams, setSearchParams] = useSearchParams();

	const socket = useMemo(
		() =>
			io("http://192.168.1.65:3000", {
				autoConnect: false
			}),
		[]
	);

	const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>();
	const [opponentPlayer, setOpponentPlayer] = useState<
		PlayerModel | undefined
	>();

	const init: UseSocketReturnType["init"] = useCallback(
		(props) => {
			socket.auth = {
				roomID: props?.roomID ?? searchParams.get("roomID"),
				side: props?.side ?? ColorSide.black,
				fen: props?.fen ?? DEFAULT_FEN
			} satisfies SocketAuthInterface;

			socket.connect();
		},

		[searchParams, socket]
	);

	const onRoomCreated = useCallback(
		(data: RoomJoinedPayload) => {
			console.log("Room created:", data);

			const player = new PlayerModel();
			player.setIdentity(data.player);

			setCurrentPlayer(player);
			setSearchParams((prev) => [...prev, ["roomID", data.roomID]]);
		},
		[setSearchParams]
	);

	const onJoinedRoom = useCallback(
		(data: RoomJoinedPayload) => {
			const player = new PlayerModel();
			player.setIdentity(data.player);

			if (!currentPlayer) {
				const [opponentEntity] = data.room.players;

				if (opponentEntity) {
					const opponent = new PlayerModel();
					opponent.setIdentity(opponentEntity);

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

	useEffect(() => {
		socket.on(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
		socket.on(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
		socket.on(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
		socket.on("disconnect", onDisconnect);
		socket.on("error", onError);

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
		socket
	]);

	useEffect(() => {
		const players: PlayerModel[] = [];

		if (currentPlayer) players.push(currentPlayer);
		// if (opponentPlayer) players.push(opponentPlayer);

		const subscription = merge(...players).subscribe((payload) => {
			const { token, value } = payload;
			const { fen = "", turn } = value || {};
			const fenValidation = validateFen(fen);

			if (
				token === "NOTIFIED" &&
				fenValidation.ok &&
				turn === currentPlayer?.color
			)
				socket.emit(SOCKET_MOVE_PERFORMED_TOKEN, value);
		});

		return () => subscription?.unsubscribe();
	}, [currentPlayer, socket]);

	return {
		socket,
		init,
		currentPlayer,
		opponentPlayer
	};
};
