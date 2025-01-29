import { filter, fromEvent, map } from "rxjs";
import { singleton } from "tsyringe";

@singleton()
export class DebugController {
	public readonly message$ = fromEvent<
		MessageEvent<{ type: string; value: unknown }>
	>(self, "message").pipe(
		filter((event) => !!event.data?.type?.startsWith?.("$tweakpane-")),
		map((event) => ({
			...event.data,
			type: event.data.type.replace("$tweakpane-", "")
		}))
	);

	constructor() {}
}
