import { FC, useEffect } from "react";

import { useSettingsStore } from "@/router/_stores";

export const GlobalTheme: FC = () => {
	const { state: storeState = {} } = useSettingsStore();

	useEffect(() => {
		const bodyElement = document.documentElement;

		bodyElement.style.setProperty(
			"--color-primary",
			storeState["visual-theme"]?.params[
				"primary-theme"
			]?.inputProps.value?.toString() || ""
		);
		bodyElement.style.setProperty(
			"--color-secondary",
			storeState["visual-theme"]?.params[
				"secondary-theme"
			]?.inputProps.value?.toString() || ""
		);
	}, [storeState]);

	return null;
};
