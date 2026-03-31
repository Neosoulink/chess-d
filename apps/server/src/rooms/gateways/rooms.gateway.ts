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

import { RoomsService } from "../services/rooms.service";
import {
	SOCKET_ROOM_CREATED_TOKEN,
	SOCKET_JOINED_ROOM_TOKEN,
	SOCKET_LEFT_ROOM_TOKEN,
	SOCKET_MOVE_PERFORMED_TOKEN,
	SOCKET_ACTION_MESSAGE_TOKEN,
	type GameUpdatedPayload,
	type SocketActionMessagePayload
} from "@chess-d/shared";

@WebSocketGateway({
	namespace: "rooms",
	cors: {
		origin: "*",
		credentials: true
	}
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private readonly server: Server;

	constructor(private readonly roomsService: RoomsService) {}

	private handleError(error: Error, socket: Socket): void {
		console.warn("Error occurred:", error.message, `<${error.cause}>`);

		this.server.to(socket.id).emit("error", {
			message: error.message,
			cause: error.cause
		});
		this.server.to(socket.id).disconnectSockets();
	}

	handleConnection(@ConnectedSocket() socket: Socket): void {
		const data = this.roomsService.register(socket);
		if (data instanceof Error) return this.handleError(data, socket);

		const { player, roomID, room } = data;

		this.server.to(socket.id).socketsJoin(roomID);
		this.server
			.to(roomID)
			.emit(
				player.host ? SOCKET_ROOM_CREATED_TOKEN : SOCKET_JOINED_ROOM_TOKEN,
				{
					room,
					player,
					roomID
				}
			);
	}

	handleDisconnect(socket: Socket): void {
		const data = this.roomsService.unregister(socket);

		if (data instanceof Error) return this.handleError(data, socket);

		const { player, roomID, room } = data;

		this.server.in(roomID).emit(SOCKET_LEFT_ROOM_TOKEN, player.id);
	}

	@SubscribeMessage(SOCKET_MOVE_PERFORMED_TOKEN)
	handleMove(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: GameUpdatedPayload
	): void {
		const data = this.roomsService.handleMove(socket, payload.move);

		if (data instanceof Error) return this.handleError(data, socket);

		this.server
			.in(socket.data.roomID)
			.except(socket.id)
			.emit(SOCKET_MOVE_PERFORMED_TOKEN, payload);
	}

	@SubscribeMessage(SOCKET_ACTION_MESSAGE_TOKEN)
	handleActionMessage(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: SocketActionMessagePayload
	): void {
		const data = this.roomsService.handleActionMessage(socket, payload);

		if (data instanceof Error) return this.handleError(data, socket);

		this.server
			.in(socket.data.roomID)
			.except(socket.id)
			.emit(SOCKET_ACTION_MESSAGE_TOKEN, data);
	}
}
