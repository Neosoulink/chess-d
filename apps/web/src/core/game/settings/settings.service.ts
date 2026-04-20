import { Lifecycle, scoped } from "tsyringe";

import { SettingsSerializedState } from "@/shared/types";
import { SETTINGS_DEFAULT_STATE } from "@/shared/constants";
import { serializeSettingsState } from "@/shared/utils/settings.util";

@scoped(Lifecycle.ContainerScoped)
export class SettingsService {
	public static readonly LOCAL_STORAGE_KEY = "core-settings";

	public state: SettingsSerializedState = serializeSettingsState(
		SETTINGS_DEFAULT_STATE
	);

	public handleUpdate(state: SettingsSerializedState): void {
		this.state = state;
	}
}
