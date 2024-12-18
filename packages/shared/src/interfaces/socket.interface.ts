import type { ColorSide } from "../enums";

export interface SocketAuthInterface {
	roomID?: string | null;
	side?: ColorSide | null;
	fen?: string | null;
	random?: string | null;
}
