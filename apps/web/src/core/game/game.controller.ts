import {
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	share,
	Subject
} from "rxjs";
import { singleton } from "tsyringe";

import { MessageData, MoveLike } from "../../shared/types";
import { GAME_RESET_TOKEN } from "../../shared/tokens";
import { ObservablePayload } from "@chess-d/shared";

@singleton()
export class GameController {
	private readonly _message$ = fromEvent<MessageEvent<MessageData>>(
		self,
		"message"
	).pipe(share());

	public readonly reset$$ = new Subject<
		{ fen?: string; pgn?: string; redoHistory?: MoveLike[] } | undefined
	>();
	public readonly reset$: Observable<
		ObservablePayload<GameController["reset$$"]>
	> = merge(
		this._message$.pipe(
			filter((message) => message.data.token === GAME_RESET_TOKEN),
			map((payload) => payload.data.value)
		),
		this.reset$$
	);

	constructor() {}
}
