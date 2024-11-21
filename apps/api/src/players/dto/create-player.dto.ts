import { Color } from "chess.js";
import { PlayerEntity } from "@chess-d/shared";

export class CreatePlayerDto implements Partial<PlayerEntity> {
	id: string;
	color: Color;
	connectedAt: Date;
	isOpponent: boolean;
}
