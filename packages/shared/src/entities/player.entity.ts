import { Color } from "chess.js";

export declare class PlayerEntity {
	id: string;
	color: Color;
	isOpponent: boolean;
	connectedAt: Date;
}
