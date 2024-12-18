import { ColorSide } from "../enums";

export declare class PlayerEntity {
	color: ColorSide;

	// Online oriented
	id?: string;
	host?: boolean;
	connectedAt?: number;
}
