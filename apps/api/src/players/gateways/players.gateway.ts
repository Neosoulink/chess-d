import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	type WsResponse
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { PlayersService } from "../services/players.service";
import {
	SOCKET_ROOM_CREATED_TOKEN,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_PERFORM_MOVE_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN
} from "@chess-d/shared";
import { Move } from "chess.js";

@WebSocketGateway({
	cors: {
		origin: "*",
		credentials: true
	}
})
export class PlayersGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	private readonly server: Server;

	constructor(private readonly playersService: PlayersService) {}

	handleConnection(@ConnectedSocket() socket: Socket) {
		const data = this.playersService.register(socket);
		if (data instanceof Error) {
			this.server
				.to(socket.id)
				.emit("error", { message: data.message, cause: data.cause });
			socket.disconnect();
			console.log(`Auto player "${socket.id}" disconnection:`, data.message);
			return;
		}

		const { player, roomID, room } = data;

		console.log(
			"=========/ Player connected /=========\n",
			player,
			`\n\nRoom "${roomID}" has ${room?.players.length} player(s).`,
			`\nGame status "${room.fen}".`,
			"\n====================================="
		);

		this.server.to(socket.id).socketsJoin(roomID);
		this.server
			.to(socket.id)
			.emit(
				player.isHost ? SOCKET_ROOM_CREATED_TOKEN : SOCKET_JOINED_ROOM_TOKEN,
				{ roomID, fen: room.fen }
			);
	}

	handleDisconnect(socket: Socket) {
		const { player, room } = this.playersService.unregister(socket);
		console.log(
			`\nPlayer left.\nID: ${player?.id}\nTotal in rooms: ${room?.players.length ?? 0}\n`
		);
	}

	@SubscribeMessage(SOCKET_PERFORM_MOVE_TOKEN)
	handlePerformMove(@ConnectedSocket() socket: Socket, @MessageBody() payload) {
		console.log("Move performed by", socket.id, payload);

		this.playersService.handleMove(socket, payload.move);

		this.server
			.in(socket.data?.roomID)
			.except(socket.id)
			.emit(SOCKET_MOVE_PERFORMED_TOKEN, payload);
	}
}
