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

import { SETTINGS_WILL_UPDATE_TOKEN } from "@/shared/tokens/settings.token";
import { MessageData, SettingsSerializedState } from "@/shared/types";

@scoped(Lifecycle.ContainerScoped)
export class SettingsController {
	public readonly update$$ = new Subject<SettingsSerializedState>();
	public readonly update$: Observable<SettingsSerializedState> = merge(
		this.update$$,
		fromEvent<MessageEvent<MessageData<SettingsSerializedState>>>(
			self,
			"message"
		).pipe(
			filter(
				(event) =>
					event.data.token === SETTINGS_WILL_UPDATE_TOKEN && !!event.data.value
			),
			map((event) => event.data.value!)
		)
	).pipe(share());

	constructor() {}
}
