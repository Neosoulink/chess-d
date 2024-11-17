import { singleton } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";

import { MessageEventPayload, MoveLike } from "../../../shared/types";
import { PIECE_WILL_MOVE_TOKEN } from "../../../shared/tokens";

@singleton()
export class PiecesController {
	public readonly playerMovedPiece$$ = new Subject<MoveLike>();

	public readonly pieceWillMove$ = fromEvent<
		MessageEvent<MessageEventPayload<MoveLike>>
	>(self, "message").pipe(
		filter((payload) => payload.data.token === PIECE_WILL_MOVE_TOKEN)
	);
}
