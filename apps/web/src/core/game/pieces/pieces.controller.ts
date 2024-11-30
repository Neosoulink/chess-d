import { singleton } from "tsyringe";
import { Move } from "chess.js";
import { filter, fromEvent, Subject } from "rxjs";

import { MessageEventPayload } from "../../../shared/types";
import { PIECE_WILL_MOVE_TOKEN } from "../../../shared/tokens";

@singleton()
export class PiecesController {
	public readonly playerMovedPiece$$ = new Subject<Move>();

	public readonly pieceWillMove$ = fromEvent<
		MessageEvent<MessageEventPayload<Move>>
	>(self, "message").pipe(
		filter((payload) => payload.data.token === PIECE_WILL_MOVE_TOKEN)
	);
}
