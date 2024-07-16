import {
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";

@WebSocketGateway(4000)
export class ExperienceGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	afterInit() {
		console.log(`WS: ${this.server.address().toString()}`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		console.log(`WS: New Client | ${client.url}`, args);
	}

	handleDisconnect(client: WebSocket) {
		console.log(`WS: Client Disconnected | ${client.url}`);
	}

	@SubscribeMessage("events")
	onEvent(@MessageBody() data: unknown): WsResponse<string> {
		console.log(`WS: On Event | ${data}`);

		return { event: "event", data: `data:${data}` };
	}
}
