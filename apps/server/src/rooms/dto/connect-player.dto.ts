import { ColorSide, PlayerEntity } from "@chess-d/shared";

export class ConnectPlayerDto implements PlayerEntity {
	id: string;
	color: ColorSide;
	connectedAt: number;
	isOpponent: boolean;
}
