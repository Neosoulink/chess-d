import { PlayerEntity } from "@chess-d/shared";

import { MessageData } from "./events.type";
import { EngineUpdatedMessageData } from "./engine.type";

export interface PlayerMessagePayload
	extends MessageData<
		Partial<EngineUpdatedMessageData["value"]> & {
			entity?: PlayerEntity;
		},
		"PICKED_PIECE" | "PLACED_PIECE" | "NOTIFIED"
	> {}
