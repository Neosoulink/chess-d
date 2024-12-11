import { PlayerEntity } from "@chess-d/shared";

import { MessageEventPayload } from "./events.type";
import { EngineGameUpdatedMessageEventPayload } from "./engine.type";

export interface PlayerMessagePayload
	extends MessageEventPayload<
		Partial<EngineGameUpdatedMessageEventPayload["value"]> & {
			entity?: PlayerEntity;
		},
		"PICKED_PIECE" | "PLACED_PIECE" | "NOTIFIED"
	> {}
