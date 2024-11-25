import { ColorSide } from "src/enums";

export interface SocketAuthInterface {
	roomID?: string | null;
	side?: ColorSide | null;
	fen?: string | null;
}
