import {
	ColorSide,
	DEFAULT_FEN,
	GameUpdatedPayload,
	PlayerEntity,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_LEFT_ROOM_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN,
	SOCKET_ROOM_CREATED_TOKEN,
	SocketAuthInterface
} from "@chess-d/shared";
import { Move } from "chess.js";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { merge } from "rxjs";
import { io } from "socket.io-client";

import { PlayerModel } from "../../../shared/models";
import {
	GAME_UPDATED_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "../../../shared/tokens";
import { EngineUpdatedMessageData, MessageData } from "../../../shared/types";
import { useGameStore, useLoaderStore } from "../../_stores";

/** @internal */
interface SocketPayload {
	room: { fen: string; players: PlayerEntity[]; startSide: ColorSide };
	player: PlayerEntity;
	roomID: string;
}

export interface WithHumanComponentProps {}

export const WithHumanComponent: FC<WithHumanComponentProps> = () => {
	const { app, initialGameState, setInitialGameState, resetGame } =
		useGameStore();
	const { setIsLoading } = useLoaderStore();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>();
	const [opponentPlayer, setOpponentPlayer] = useState<
		PlayerModel | undefined
	>();

	const socket = useMemo(
		() =>
			io(import.meta.env.PUBLIC_SERVER_HOST, {
				autoConnect: false
			}),
		[]
	);

	const locationKey = useMemo(() => location.key, [location.key]);

	const onRoomCreated = useCallback(
		(data: SocketPayload) => {
			console.log("Room created:", data);

			const player = new PlayerModel();
			player.setEntity(data.player);

			socket.auth = {
				...socket.auth,
				startSide: data?.room?.startSide,
				roomID: data.roomID,
				side: player.color,
				fen: data.room.fen
			};

			setCurrentPlayer(player);
			setSearchParams((prev) => [...prev, ["roomID", data.roomID]]);
			setInitialGameState({
				playerSide: player.color,
				startSide: player.color,
				fen: data.room.fen
			});
			resetGame();

			setTimeout(() => setIsLoading(false), 100);
		},
		[resetGame, setInitialGameState, setIsLoading, setSearchParams, socket]
	);

	const onJoinedRoom = useCallback(
		(data: SocketPayload) => {
			const player = new PlayerModel();
			const socketAuth = socket.auth as SocketAuthInterface;

			player.setEntity(data.player);

			if (!currentPlayer) {
				const [opponentEntity] = data.room.players;
				socketAuth.roomID = data.roomID;
				socketAuth.fen = data.room.fen;
				socketAuth.side = player.color;
				socketAuth.startSide = data.room.startSide;

				if (opponentEntity) {
					const opponent = new PlayerModel();
					opponent.setEntity(opponentEntity);

					setOpponentPlayer(opponent);
				}

				setCurrentPlayer(player);
				setInitialGameState({
					fen: socketAuth.fen,
					startSide: socketAuth.startSide,
					playerSide: socketAuth.side
				});
				resetGame();
				setSearchParams((_urlSearchParams) => {
					_urlSearchParams.set("roomID", data.roomID);
					return _urlSearchParams;
				});
			} else {
				currentPlayer.host = true;
				setOpponentPlayer(player);
			}

			setTimeout(() => setIsLoading(false), 100);

			console.log("Joined room:", data);
		},
		[
			currentPlayer,
			resetGame,
			setInitialGameState,
			setIsLoading,
			setSearchParams,
			socket
		]
	);

	const onLeftRoom = useCallback((playerId: string) => {
		console.log("Player left room.", playerId);

		setOpponentPlayer(undefined);
	}, []);

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

			if (error.cause === "ROOM_FULL") return;

			setTimeout(() => socket.connect(), 1000);
		},
		[setSearchParams, socket]
	);

	const moveBoardPiece = useCallback(
		(move: Move) => {
			app?.module?.getWorker()?.postMessage?.({
				token: PIECE_WILL_MOVE_TOKEN,
				value: move
			} satisfies MessageData<Move>);
		},
		[app?.module]
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
		setIsLoading(true);
	}, [location, currentPlayer, setIsLoading, socket]);

	useEffect(() => {
		socket.on(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
		socket.on(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
		socket.on(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
		socket.on(SOCKET_LEFT_ROOM_TOKEN, onLeftRoom);
		socket.on("disconnect", onDisconnect);
		socket.on("error", onError);

		if (!socket.connected) {
			socket.auth = {
				...socket.auth,
				roomID: searchParams.get("roomID"),
				side: initialGameState?.playerSide,
				startSide: initialGameState?.startSide,
				fen: initialGameState?.fen,
				random: searchParams.get("random")
			} satisfies SocketAuthInterface;

			socket.connect();
		}

		return () => {
			socket.off(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
			socket.off(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
			socket.off(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
			socket.off(SOCKET_LEFT_ROOM_TOKEN, onLeftRoom);
			socket.off("disconnect", onDisconnect);
			socket.off("error", onError);
		};
	}, [
		onDisconnect,
		onError,
		onJoinedRoom,
		onLeftRoom,
		onMovePerformed,
		onRoomCreated,
		searchParams,
		setIsLoading,
		socket,
		location
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
			payload: MessageEvent<EngineUpdatedMessageData>
		) => {
			const { token, value } = payload.data;
			const { fen } = value || {};

			if (!fen || !token) return;

			console.log("Received message:", payload.data);
			if (token === GAME_UPDATED_TOKEN)
				players.forEach((player) => {
					player?.next({
						token: "NOTIFIED",
						value: { ...payload.data.value, entity: player.getEntity() }
					});
				});
		};

		app?.module?.getWorker()?.addEventListener("message", handleMessages);

		return () => {
			subscription.unsubscribe();
			app?.module?.getWorker?.().removeEventListener("message", handleMessages);
		};
	}, [app, currentPlayer, opponentPlayer, moveBoardPiece, socket, app?.module]);

	useEffect(() => {
		const roomId = searchParams.get("roomID");
		const auth = socket.auth as SocketAuthInterface;

		if (roomId === auth?.roomID) return;

		socket.disconnect();
	}, [location, locationKey, onDisconnect, searchParams, socket]);

	useEffect(() => {
		return () => {
			socket.disconnect();
		};
	}, [onDisconnect, socket]);

	return null;
};
