import { SettingsSerializedState, SettingsState } from "../types";

export const serializeSettingsState = (
	state?: SettingsState | null
): SettingsSerializedState => {
	return Object.entries(state || {}).reduce((acc, [key, value]) => {
		acc[key] = {
			label: value.label,
			params: Object.entries(value.params).reduce((acc2, [key2, value2]) => {
				acc2[key2] = {
					id: value2.id,
					label: value2.label,
					value:
						value2.inputProps.type === "checkbox"
							? value2.inputProps.checked
							: value2.inputProps.value
				};
				return acc2;
			}, {})
		};
		return acc;
	}, {});
};
