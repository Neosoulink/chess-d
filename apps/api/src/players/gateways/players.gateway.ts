import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException
} from "@nestjs/websockets";
import { Namespace, Server, Socket } from "socket.io";
import { PlayerEntity } from "@chess-d/api";

@WebSocketGateway()
export class PlayersGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	private readonly server: Server;

	// @ts-ignore
	@WebSocketServer({ namespace: "namespace" })
	private readonly namespace: Namespace;

	readonly players: Record<string, PlayerEntity> = {};

	constructor() {
		console.log("PlayersGateway created", this.server, this.namespace);
	}

	handleConnection(@ConnectedSocket() player: Socket, ...args: any[]) {
		console.log("Client connected", player.id, args);

		const newPlayer: PlayerEntity = {
			id: player.id,
			color: "b",
			isOpponent: false,
			connectedAt: new Date()
		};

		/** Send to the new player himself's info */
		this.server.to(player.id).emit("player_info", newPlayer);

		/** Send to the new player other players info */
		this.server.to(player.id).emit("players_info", this.players);

		/** Add the new player info into the peers list */
		this.players[player.id] = newPlayer;

		/** Send to other players the new player info */
		this.server.except(player.id).emit("player_joined", newPlayer);

		console.log(
			`New player joined.\nID: ${player.id}.\nTotal players: ${this.server.engine.clientsCount}`
		);
	}

	handleDisconnect(client: Socket) {
		if (this.players[client.id]) delete this.players[client.id];
		this.server.emit("player_left", client.id);

		console.log(
			`Player left.\nID: ${this.server.engine.clientsCount}\nTotal players: ${this.server.engine.clientsCount}`
		);
	}

	@SubscribeMessage("player_moved")
	async move(
		@MessageBody() playerBody: PlayerEntity,
		@ConnectedSocket() player: Socket
	) {
		if (!this.players[player.id])
			throw new WsException("Invalid Player Socket ID");

		this.players[player.id] = {
			...this.players[player.id],
			...playerBody
		};

		this.server
			.except(player.id)
			.emit("player_updated", this.players[player.id]);
		this.server.except(player.id).emit("players_updated", this.players);
	}
}
