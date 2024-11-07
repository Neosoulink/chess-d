import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PlayerEntity } from "@chess-d/api";

export interface UseSocketContext {
	socket: Socket;
	currentPlayer: PlayerEntity | undefined;
	playersList: PlayerEntity[];
}

export const useSocket: () => UseSocketContext = () => {
	const socket = useMemo(
		() =>
			io("http://192.168.1.72:3000", {
				autoConnect: false
			}),
		[]
	);

	const [currentPlayer, setCurrentPlayer] = useState<
		PlayerEntity | undefined
	>();
	const [playersList, setPlayersList] = useState<PlayerEntity[]>([]);

	const onPlayerInfo = useCallback((player: PlayerEntity) => {
		setCurrentPlayer(player);
	}, []);
	const onPlayersInfo = useCallback((players: Record<string, PlayerEntity>) => {
		setPlayersList(
			Object.keys(players).map((id) => players[id] as PlayerEntity)
		);
	}, []);
	const onPlayerJoined = useCallback(async (newPlayer: PlayerEntity) => {
		setPlayersList((prev) => [...prev, newPlayer]);
	}, []);
	const onPlayerLeft = useCallback(
		(playerId: string) => {
			setPlayersList(playersList.filter((player) => player.id !== playerId));
		},
		[playersList]
	);
	const onPlayersUpdated = useCallback(
		(players: Record<string, PlayerEntity>) => {
			if (!currentPlayer?.id) return;

			setPlayersList(
				Object.keys(players)
					.map((id) => players[id] as PlayerEntity)
					.filter((oldPlayer) => oldPlayer.id !== currentPlayer.id)
			);
		},
		[currentPlayer]
	);

	useEffect(() => {
		socket.on("player_info", onPlayerInfo);
		socket.on("players_info", onPlayersInfo);
		socket.on("player_joined", onPlayerJoined);
		socket.on("player_left", onPlayerLeft);
		socket.on("players_updated", onPlayersUpdated);

		return () => {
			socket.off("player_info", onPlayerInfo);
			socket.off("players_info", onPlayersInfo);
			socket.off("player_joined", onPlayerJoined);
			socket.off("player_left", onPlayerLeft);
			socket.off("players_updated", onPlayersUpdated);
		};
	}, [
		onPlayerInfo,
		onPlayersInfo,
		onPlayerJoined,
		onPlayerLeft,
		onPlayersUpdated
	]);

	return {
		socket,
		currentPlayer,
		playersList
	};
};
