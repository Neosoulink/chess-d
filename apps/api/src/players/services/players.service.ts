import { Injectable } from "@nestjs/common";
import {
	ColorSide,
	DEFAULT_FEN,
	getOppositeColorSide,
	PlayerEntity,
	SocketAuthInterface
} from "@chess-d/shared";
import { randomUUID, UUID } from "crypto";
import { validateFen, type Move } from "chess.js";
import type { Socket } from "socket.io";

@Injectable()
export class PlayersService {
	private readonly rooms: Record<
		UUID,
		{ fen: string; players: PlayerEntity[] }
	> = {};

	register(socket: Socket):
		| {
				player: PlayerEntity;
				roomID: string;
				room: PlayersService["rooms"][UUID];
		  }
		| Error {
		const {
			roomID: queryRoomID,
			side: colorSide,
			fen: authFen
		} = socket.handshake.auth as SocketAuthInterface;
		const fen =
			typeof authFen === "string" && validateFen(authFen)
				? authFen
				: DEFAULT_FEN;

		let roomID: UUID | undefined;

		if (
			typeof queryRoomID === "string" &&
			!Array.isArray(this.rooms[queryRoomID]?.players)
		)
			return new Error("Invalid room ID.", { cause: "ROOM_NOT_FOUND" });

		const player: PlayerEntity = {
			id: socket.id,
			color: (colorSide as ColorSide) ?? ColorSide.black,
			connectedAt: new Date(),
			isHost: true
		};

		if (typeof queryRoomID === "string") {
			if (this.rooms[queryRoomID]?.players?.length !== 1)
				return new Error("Unable to join a room without a player or full.", {
					cause: this.rooms[queryRoomID]
						? this.rooms[queryRoomID].players.length > 1
							? "ROOM_FULL"
							: "ROOM_EMPTY"
						: "ROOM_NOT_FOUND"
				});

			player.color = getOppositeColorSide(
				this.rooms[queryRoomID].players[0].color
			);
			player.isHost = false;

			roomID = queryRoomID as UUID;
			this.rooms[roomID].players.push(player);
		}

		if (!roomID) {
			roomID = randomUUID();
			this.rooms[roomID] = { fen, players: [player] };
		}

		socket.data = { roomID };
		return { player, roomID, room: this.rooms[roomID] };
	}

	unregister(socket: Socket):
		| {
				roomID: string;
				room: PlayersService["rooms"][UUID];
				player: PlayerEntity;
		  }
		| Error {
		const { roomID } = socket.data;
		const room = this.rooms[roomID];

		if (!room) return new Error("Room not found.", { cause: "ROOM_NOT_FOUND" });

		let player: PlayerEntity | undefined;

		room.players.splice(
			room.players.findIndex((_player) => {
				if (_player.id === socket.id) {
					player = _player;
					return true;
				}

				return false;
			}),
			1
		);

		if (room.players.length === 0) delete this.rooms[roomID];
		else room.players[0].isHost = true;

		return { roomID, room, player };
	}

	handleMove(socket: Socket, move?: Move): string | Error {
		if (typeof move?.after !== "string" || !validateFen(move.after))
			return new Error("Invalid move.", { cause: "INVALID_MOVE" });

		const roomID = socket.data?.roomID;
		const room = this.rooms[roomID];

		if (!room || room.fen !== move.before)
			return new Error("Move desynchronized with the room fen.", {
				cause: "DESYNCHRONIZED"
			});

		this.rooms[roomID].fen = move.after;

		return this.rooms[roomID].fen;
	}
}
