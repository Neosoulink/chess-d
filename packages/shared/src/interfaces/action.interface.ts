import { ColorSide } from "../enums";

export interface ActionMessagePayload {
	side: ColorSide;
	emote?: string;
	message?: string;
}
