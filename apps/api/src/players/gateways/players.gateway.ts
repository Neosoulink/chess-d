import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Namespace, Server, Socket } from "socket.io";

@WebSocketGateway()
export class PlayersGateway implements OnGatewayConnection {
	@WebSocketServer() private readonly server: Server;

	// @ts-ignore
	@WebSocketServer({ namespace: "namespace" })
	private readonly namespace: Namespace;

	constructor() {
		console.log("PlayersGateway created", this.server, this.namespace);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log("Client connected", client.id, args);
	}

	@SubscribeMessage("message")
	handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
		payload: any
	): string {
		console.log(data, client.connected);

		return data;
	}
}
