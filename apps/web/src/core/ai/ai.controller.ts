import type { Move } from "chess.js";
import { Lifecycle, scoped } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";

import { AI_WILL_PERFORM_MOVE_TOKEN } from "../../shared/tokens";
import type { AiWillPerformMovePayload, MessageData } from "../../shared/types";

@scoped(Lifecycle.ContainerScoped)
export class AiController {
	public readonly movePerformed$$ = new Subject<MessageData<{ move: Move }>>();
	public readonly willPerformMove$ = fromEvent<
		MessageEvent<MessageData<AiWillPerformMovePayload>>
	>(self, "message").pipe(
		filter(
			(
				payload
			): payload is MessageEvent<MessageData<AiWillPerformMovePayload>> =>
				!!payload?.data?.value &&
				payload.data.token === AI_WILL_PERFORM_MOVE_TOKEN
		)
	);
}
