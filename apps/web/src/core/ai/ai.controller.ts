import { singleton } from "tsyringe";
import { filter, fromEvent, Subject } from "rxjs";

import { MoveLike } from "../../shared/types";
import { RegisterLifecycleState } from "@quick-threejs/reactive";

@singleton()
export class AiController {
	public readonly lifecycle$$ = new Subject<RegisterLifecycleState>();
	public readonly movePerformed$$ = new Subject<{
		type: string;
		payload: MoveLike;
	}>();

	public readonly performMove$ = fromEvent<
		MessageEvent<{
			type: string;
			payload: { fen: string };
		}>
	>(self, "message").pipe(
		filter((message) => message.data.type === "perform_move")
	);
}
