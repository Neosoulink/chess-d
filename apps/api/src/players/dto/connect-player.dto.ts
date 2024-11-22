import { Color } from "chess.js";
import { PlayerEntity } from "@chess-d/shared";

export class ConnectPlayerDto implements Partial<PlayerEntity> {
	id: string;
	color: Color;
	connectedAt: Date;
	isOpponent: boolean;
}
