import { ObservablePayload } from "@chess-d/shared";
import {
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share,
	Subject
} from "rxjs";
import { Lifecycle, scoped } from "tsyringe";

import { GameResetState, MessageData } from "../../shared/types";
import { GAME_RESET_TOKEN } from "../../shared/tokens";

@scoped(Lifecycle.ContainerScoped)
export class GameController {
	private readonly _message$ = fromEvent<MessageEvent<MessageData>>(
		self,
		"message"
	).pipe(share());

	public readonly reset$$ = new Subject<GameResetState | undefined>();
	public readonly reset$: Observable<GameResetState> = merge(
		this._message$.pipe(
			filter((message) => message.data.token === GAME_RESET_TOKEN),
			map((payload) => payload.data.value)
		),
		this.reset$$
	).pipe(share());

	constructor() {}
}
