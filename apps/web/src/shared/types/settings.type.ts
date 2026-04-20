import type { IconKey, InputProps } from "@/router/_components/core";

export type SettingsState = Record<
	string,
	{
		label: string;
		icon: IconKey;
		params: Record<
			string,
			{
				id: string;
				label: string;
				inputProps: InputProps;
				dependsOn?: string[];
				options?: { value: string | number | boolean; label: string }[];
			}
		>;
	}
>;

export type SettingsSerializedState = Record<
	string,
	{
		label: string;
		params: Record<
			string,
			{
				id: string;
				label: string;
				value?: string | number | boolean;
			}
		>;
	}
>;
