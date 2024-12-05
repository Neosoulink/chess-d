import { Color } from "chess.js";

export declare class PlayerEntity {
	color: Color;

	// Online oriented
	id?: string;
	host?: boolean;
	connectedAt?: number;
}
