import {
	BehaviorSubject,
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share
} from "rxjs";
import { singleton } from "tsyringe";

import { MessageEventPayload } from "../../shared/types";
import { GAME_RESET_TOKEN, GAME_STATE_TOKEN } from "../../shared/tokens";

@singleton()
export class GameController {
	private readonly _message$ = fromEvent<MessageEvent<MessageEventPayload>>(
		self,
		"message"
	).pipe(share());
	public readonly reset$: Observable<string | undefined> = this._message$.pipe(
		filter((message) => message.data.token === GAME_RESET_TOKEN),
		map((payload) => payload.data.value?.fen)
	);

	public readonly state$$ = new BehaviorSubject<"idle" | "playing">("idle");

	public readonly state$: Observable<"idle" | "playing"> = merge(
		this.state$$,
		fromEvent<
			MessageEvent<
				MessageEventPayload<{
					value: "idle" | "playing";
				}>
			>
		>(self, "message").pipe(
			filter((message) => message.data.token === GAME_STATE_TOKEN),
			map((message) => message.data.value!)
		) as unknown as Observable<"idle" | "playing">
	);

	constructor() {}
}
