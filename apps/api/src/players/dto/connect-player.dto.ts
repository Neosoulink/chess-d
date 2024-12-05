import { Color } from "chess.js";
import { PlayerEntity } from "@chess-d/shared";

export class ConnectPlayerDto implements PlayerEntity {
	id: string;
	color: Color;
	connectedAt: number;
	isOpponent: boolean;
}
