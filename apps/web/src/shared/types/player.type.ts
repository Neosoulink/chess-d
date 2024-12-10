import { MessageEventPayload } from "./events.type";
import { EngineGameUpdatedMessageEventPayload } from "./engine.type";

export interface PlayerMessagePayload
	extends MessageEventPayload<
		Partial<EngineGameUpdatedMessageEventPayload["value"]>,
		"PICKED_PIECE" | "PLACED_PIECE" | "NOTIFIED"
	> {}
