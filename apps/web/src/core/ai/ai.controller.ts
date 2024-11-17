import { singleton } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";
import { RegisterLifecycleState } from "@quick-threejs/reactive";

import { MessageEventPayload, MoveLike } from "../../shared/types";
import { AI_WILL_PERFORM_MOVE_TOKEN } from "../../shared/tokens";

@singleton()
export class AiController {
	public readonly lifecycle$$ = new Subject<RegisterLifecycleState>();
	public readonly movePerformed$$ = new Subject<
		MessageEventPayload<MoveLike>
	>();

	public readonly willPerformMove$ = fromEvent<
		MessageEvent<MessageEventPayload<{ fen: string }>>
	>(self, "message").pipe(
		filter((message) => message.data.token === AI_WILL_PERFORM_MOVE_TOKEN)
	);
}
