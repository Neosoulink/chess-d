import { filter, fromEvent } from "rxjs";
import { singleton } from "tsyringe";

import { MessageEventPayload } from "../../shared/types";
import { GAME_WILL_RESET_TOKEN } from "../../shared/tokens";

@singleton()
export class GameController {
	public readonly piecesWillReset$ = fromEvent<
		MessageEvent<MessageEventPayload<{ fen?: string }>>
	>(self, "message").pipe(
		filter((payload) => payload.data.token === GAME_WILL_RESET_TOKEN)
	);

	constructor() {}
}
