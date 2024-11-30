import { singleton } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";
import type { Move } from "chess.js";
import type { RegisterLifecycleState } from "@quick-threejs/reactive";

import { AI_WILL_PERFORM_MOVE_TOKEN } from "../../shared/tokens";
import type { MessageEventPayload } from "../../shared/types";

@singleton()
export class AiController {
	public readonly lifecycle$$ = new Subject<RegisterLifecycleState>();
	public readonly movePerformed$$ = new Subject<MessageEventPayload<Move>>();
	public readonly willPerformMove$ = fromEvent<
		MessageEvent<MessageEventPayload<{ fen: string }>>
	>(self, "message").pipe(
		filter((message) => message.data.token === AI_WILL_PERFORM_MOVE_TOKEN)
	);
}
