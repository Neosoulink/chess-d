import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
	WsResponse
} from "@nestjs/websockets";
import { PlayerEntity } from "@chess-d/shared";
import { Server, Socket } from "socket.io";

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
	private readonly rooms: Record<string, PlayerEntity[]> = {};

	handleConnection(@ConnectedSocket() socket: Socket) {
		const newPlayer: PlayerEntity = {
			id: socket.id,
			color: "b",
			connectedAt: new Date(),
			isOpponent: false
		};

		this.server.to(socket.id).emit("player_info", newPlayer);
		this.server.to(socket.id).emit("players_info", this.rooms);

		this.rooms[socket.id] = [newPlayer];

		this.server.except(socket.id).emit("player_joined", newPlayer);

		console.log(
			`New player joined.\nID: ${socket.id}.\nTotal rooms: ${this.server.engine.clientsCount}`
		);
	}

	handleDisconnect(socket: Socket) {
		if (this.rooms[socket.id]) delete this.rooms[socket.id];
		this.server.emit("player_left", socket.id);

		console.log(
			`Player left.\nID: ${this.server.engine.clientsCount}\nTotal rooms: ${this.server.engine.clientsCount}`
		);
	}

	@SubscribeMessage("player_moved")
	async move(
		@MessageBody() playerBody: PlayerEntity,
		@ConnectedSocket() socket: Socket
	): Promise<WsResponse<PlayerEntity[]>> {
		if (!this.rooms[socket.id])
			throw new WsException("Invalid Player Socket ID");

		this.rooms[socket.id] = {
			...this.rooms[socket.id],
			...playerBody
		};

		this.server.except(socket.id).emit("player_updated", this.rooms[socket.id]);
		this.server.except(socket.id).emit("players_updated", this.rooms);

		return { event: "player_moved", data: this.rooms[socket.id] };
	}
}
