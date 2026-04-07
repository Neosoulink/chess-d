import { SettingsSerializedState } from "@/shared/types";
import { Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class SettingsService {
	public static readonly LOCAL_STORAGE_KEY = "core-settings";

	public state: SettingsSerializedState = {};

	constructor() {}
}
