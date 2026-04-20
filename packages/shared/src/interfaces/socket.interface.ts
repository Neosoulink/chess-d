import { PlayerEntity } from "../entities";
import type { ColorSide } from "../enums";
import { ActionMessagePayload } from "./action.interface";

export interface SocketAuthInterface {
	roomID?: string | null;
	side?: ColorSide | null;
	startSide?: ColorSide | null;
	fen?: string | null;
	random?: string | null;
}

export interface SocketActionMessagePayload extends ActionMessagePayload {
	player: PlayerEntity;
	roomID?: string;
}
