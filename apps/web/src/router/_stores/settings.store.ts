import { create } from "zustand";
import { excludeProperties, Properties } from "@quick-threejs/utils";
import { SettingsSerializedState, SettingsState } from "@/shared/types";

import { serializeSettingsState } from "@/shared/utils/settings.util";
import {
	SETTINGS_LOCAL_STORAGE_KEY,
	SETTINGS_DEFAULT_STATE
} from "@/shared/constants";

export interface SettingsStore {
	state: SettingsState;
	serializedState?: SettingsSerializedState | null;
	applyState: (state?: Partial<SettingsState>) => void;
	reset: () => void;
}

export const settingsStoreInitialState: Properties<SettingsStore> = {
	state: JSON.parse(JSON.stringify(SETTINGS_DEFAULT_STATE))
};

export const useSettingsStore = create<SettingsStore>((set, get) => {
	const getSafeLocalState = () => {
		const localState: SettingsSerializedState | undefined = JSON.parse(
			localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY) ?? "{}"
		);
		const newState = excludeProperties(
			JSON.parse(JSON.stringify(SETTINGS_DEFAULT_STATE)),
			[]
		) as SettingsState;
		delete newState["type"];

		Object.entries(localState || {}).forEach(([sectionKey, sectionData]) => {
			if (!newState[sectionKey]) return;

			Object.entries(sectionData.params).forEach(
				([localParamKey, localParam]) => {
					const newStateParam = newState[sectionKey]?.params[localParamKey];
					const storedParam =
						get().serializedState?.[sectionKey]?.params[localParamKey];
					const defaultParam = JSON.parse(
						JSON.stringify(SETTINGS_DEFAULT_STATE)
					)[sectionKey]?.params[localParamKey];
					const newValue =
						localParam.value ??
						storedParam?.value ??
						defaultParam?.inputProps.value;

					if (!newStateParam) return;

					newStateParam.inputProps.value =
						typeof newValue === "boolean" ? newValue?.toString() : newValue;
					if (newStateParam.inputProps.type === "checkbox")
						newStateParam.inputProps.checked = !!newValue;
				}
			);
		});

		return newState;
	};

	return {
		...settingsStoreInitialState,
		applyState: (state = {}) => {
			const newState = getSafeLocalState();

			Object.entries(state).forEach(([sectionKey, sectionData]) => {
				Object.entries(sectionData?.params ?? {}).forEach(
					([paramKey, paramData]) => {
						const newStateParam = newState[sectionKey]?.params[paramKey];
						if (!newStateParam) return;

						newStateParam.inputProps.value = paramData.inputProps.value;
						if (newStateParam.inputProps.type === "checkbox")
							newStateParam.inputProps.checked = !!paramData.inputProps.checked;
					}
				);
			});

			const serializedState = serializeSettingsState(newState);

			set(() => ({
				state: newState,
				serializedState
			}));
			localStorage.setItem(
				SETTINGS_LOCAL_STORAGE_KEY,
				JSON.stringify(serializedState)
			);
		},
		reset: () => {
			const newState = JSON.parse(JSON.stringify(SETTINGS_DEFAULT_STATE));
			const serializedState = serializeSettingsState(newState);

			set(() => ({
				state: newState,
				serializedState
			}));

			localStorage.setItem(
				SETTINGS_LOCAL_STORAGE_KEY,
				JSON.stringify(serializedState)
			);
		}
	};
});
