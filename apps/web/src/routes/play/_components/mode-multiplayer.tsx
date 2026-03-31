import {
	ColorSide,
	GameUpdatedPayload,
	ObservablePayload,
	PlayerEntity,
	SOCKET_ACTION_MESSAGE_TOKEN,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_LEFT_ROOM_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN,
	SOCKET_ROOM_CREATED_TOKEN,
	SocketActionMessagePayload,
	SocketAuthInterface
} from "@chess-d/shared";
import { Move } from "chess.js";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { merge } from "rxjs";
import { io } from "socket.io-client";

import { PlayerModel } from "@/shared/models";
import {
	GAME_UPDATED_TOKEN,
	HAND_STARTED_EMOTE_TOKEN,
	HAND_WILL_EMOTE_TOKEN,
	PIECE_WILL_MOVE_TOKEN
} from "@/shared/tokens";
import { HANDS_SUPPORT_EMOTES } from "@/shared/constants";
import { EngineUpdatedMessageData, MessageData } from "@/shared/types";
import { useGameStore, useLoaderStore } from "../../_stores";
import { useChatStore } from "@/routes/_stores/chat.store";
import { HandsController } from "@/core/game/world/hands/hands.controller";

/** @internal */
interface SocketPayload {
	room: { fen: string; players: PlayerEntity[]; startSide: ColorSide };
	player: PlayerEntity;
	roomID: string;
}

export interface PlayModeMultiplayerProps {}

export const PlayModeMultiplayer: FC<PlayModeMultiplayerProps> = () => {
	const { app, initialGameState, setInitialGameState, resetGame } =
		useGameStore();
	const { chat$, notify: chatNotify } = useChatStore();
	const { setIsLoading } = useLoaderStore();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>();
	const [opponentPlayer, setOpponentPlayer] = useState<
		PlayerModel | undefined
	>();

	const socket = useMemo(
		() =>
			io(`${import.meta.env.PUBLIC_SERVER_HOST}/rooms`, {
				autoConnect: false
			}),
		[]
	);

	const locationKey = useMemo(() => location.key, [location.key]);

	const onRoomCreated = useCallback(
		(data: SocketPayload) => {
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

			setTimeout(() => setIsLoading(false), 300);
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

			setTimeout(() => setIsLoading(false), 300);
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
		setOpponentPlayer(undefined);
	}, []);

	const onDisconnect = useCallback(() => {
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
			app?.module?.getWorkerThread()?.worker?.postMessage?.({
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
		},
		[opponentPlayer]
	);

	const onActionMessage = useCallback(
		(data: SocketActionMessagePayload) => {
			const appWorker = app?.module?.getWorkerThread()?.worker;
			const emote = HANDS_SUPPORT_EMOTES.find(
				(emote) => emote.key === data.emote
			);

			if (!appWorker || data.player.id === currentPlayer?.getEntity()?.id)
				return;

			if (emote)
				return appWorker.postMessage?.({
					token: HAND_WILL_EMOTE_TOKEN,
					value: {
						emote,
						side: data.side,
						duration: 3
					} satisfies ObservablePayload<HandsController["emote$$"]>
				});

			if (data.message)
				return chatNotify({
					content: data.message,
					side: data.side,
					type: "message"
				});
		},
		[app?.module, currentPlayer]
	);

	useEffect(() => {
		setIsLoading(true);
	}, [location, currentPlayer, setIsLoading, socket]);

	useEffect(() => {
		socket.on(SOCKET_ROOM_CREATED_TOKEN, onRoomCreated);
		socket.on(SOCKET_JOINED_ROOM_TOKEN, onJoinedRoom);
		socket.on(SOCKET_MOVE_PERFORMED_TOKEN, onMovePerformed);
		socket.on(SOCKET_LEFT_ROOM_TOKEN, onLeftRoom);
		socket.on(SOCKET_ACTION_MESSAGE_TOKEN, onActionMessage);
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
			socket.off(SOCKET_ACTION_MESSAGE_TOKEN, onActionMessage);
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
		const appWorker = app?.module?.getWorkerThread()?.worker;
		const players: PlayerModel[] = [];

		if (!appWorker) return;
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
			)
				socket.emit(SOCKET_MOVE_PERFORMED_TOKEN, value);

			if (payload.token === "PLACED_PIECE" && move) return moveBoardPiece(move);
		});

		const handleMessages = (
			payload: MessageEvent<EngineUpdatedMessageData>
		) => {
			const { token, value } = payload.data;
			const { fen } = value || {};

			if (!fen || !token) return;

			if (token === GAME_UPDATED_TOKEN)
				players.forEach((player) => {
					player?.next({
						token: "NOTIFIED",
						value: { ...payload.data.value, entity: player.getEntity() }
					});
				});
		};

		appWorker?.addEventListener("message", handleMessages);

		return () => {
			subscription.unsubscribe();
			appWorker?.removeEventListener("message", handleMessages);
		};
	}, [app, currentPlayer, opponentPlayer, moveBoardPiece, socket, app?.module]);

	useEffect(() => {
		const sub = chat$.subscribe((chat) => {
			const player = currentPlayer?.getEntity();
			if (!player || chat.side !== player.color || chat.type !== "message")
				return;

			const messagePayload: SocketActionMessagePayload = {
				player,
				side: chat.side,
				message: chat.content
			};

			socket.emit(SOCKET_ACTION_MESSAGE_TOKEN, messagePayload);
		});

		return () => {
			sub.unsubscribe();
		};
	}, [chat$, currentPlayer, socket]);

	useEffect(() => {
		const appWorker = app?.module?.getWorkerThread()?.worker;
		if (!appWorker) return;

		const handleMessages = (
			payload: MessageEvent<
				MessageData<ObservablePayload<HandsController["emote$$"]>>
			>
		) => {
			const player = currentPlayer?.getEntity();
			const value = payload.data.value;
			const token = payload.data.token;

			if (
				!player ||
				!value ||
				player.color !== value.side ||
				token !== HAND_STARTED_EMOTE_TOKEN
			)
				return;

			const messagePayload: SocketActionMessagePayload = {
				player,
				side: value.side,
				emote: value.emote.key
			};

			socket.emit(SOCKET_ACTION_MESSAGE_TOKEN, messagePayload);
		};

		appWorker.addEventListener("message", handleMessages);

		return () => {
			appWorker.removeEventListener("message", handleMessages);
		};
	}, [app?.module, currentPlayer, socket]);

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
