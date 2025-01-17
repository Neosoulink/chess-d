import { singleton } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";
import type { Move } from "chess.js";

import { AI_WILL_PERFORM_MOVE_TOKEN } from "../../shared/tokens";
import type { MessageEventPayload } from "../../shared/types";
import { SupportedAiModel } from "@chess-d/ai";

@singleton()
export class AiController {
	public readonly movePerformed$$ = new Subject<
		MessageEventPayload<{ move: Move }>
	>();
	public readonly willPerformMove$ = fromEvent<
		MessageEvent<MessageEventPayload<{ ai: SupportedAiModel; fen: string }>>
	>(self, "message").pipe(
		filter((message) => message.data.token === AI_WILL_PERFORM_MOVE_TOKEN)
	);
}
