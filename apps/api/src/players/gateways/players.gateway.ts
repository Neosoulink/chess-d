import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { PlayersService } from "../services/players.service";
import {
	SOCKET_ROOM_CREATED_TOKEN,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_PERFORM_MOVE_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN,
	type GameUpdatedPayload
} from "@chess-d/shared";

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

	private handleError(socket: Socket, error: Error): void {
		this.handleDisconnect(socket);

		this.server.to(socket.id).emit("error", {
			message: error.message,
			cause: error.cause
		});

		console.warn("Error occurred:", error.message, `<${error.cause}>`);
	}

	handleConnection(@ConnectedSocket() socket: Socket): void {
		const data = this.playersService.register(socket);
		if (data instanceof Error) return this.handleError(socket, data);

		const { player, roomID, room } = data;

		console.log(
			"\n=========/ Player connected /=========\n",
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

	handleDisconnect(socket: Socket): void {
		const unregisterRes = this.playersService.unregister(socket);

		if (unregisterRes instanceof Error) return;

		const { player, roomID, room } = unregisterRes;

		this.server.to(player.id).disconnectSockets();
		console.log(
			`\nPlayer "${player?.id}" left room "${roomID}".\nTotal in rooms: ${room?.players.length ?? 0}`
		);
	}

	@SubscribeMessage(SOCKET_PERFORM_MOVE_TOKEN)
	handleMove(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: GameUpdatedPayload
	): void {
		const data = this.playersService.handleMove(socket, payload.move);

		if (data instanceof Error) return this.handleError(socket, data);

		console.log("\nMove performed by", socket.id, payload);
		this.server
			.in(socket.data?.roomID)
			.except(socket.id)
			.emit(SOCKET_MOVE_PERFORMED_TOKEN, payload);
	}
}
