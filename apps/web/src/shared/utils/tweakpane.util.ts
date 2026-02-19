import { Pane } from "tweakpane";

import { DEBUG_OPTIONS } from "../constants";

export const configureTweakpane = (
	pane: Pane,
	onChange?: (type: string, value: unknown) => unknown
) => {
	const params: Record<string, unknown> = {};
	const paneFolder = pane.addFolder({ title: "Debug" });

	paneFolder.expanded = true;

	Object.keys(DEBUG_OPTIONS).forEach((folderTitle, index) => {
		const folderParams = DEBUG_OPTIONS[folderTitle];
		const folder = paneFolder.addFolder({
			title: folderTitle,
			expanded: index === 0
		});

		if (!folderParams) return;

		Object.keys(folderParams).forEach((bladeLabel) => {
			if (folderParams[bladeLabel]!.default === "$button")
				return folder
					.addButton({ title: bladeLabel })
					.on("click", () => onChange?.(`${folderTitle}~${bladeLabel}`, true));

			params[bladeLabel] = folderParams[bladeLabel]!.default;

			return folder
				.addBinding(params, bladeLabel, {
					...folderParams[bladeLabel]?.config,
					label: bladeLabel
				})
				.on("change", ({ value }) =>
					onChange?.(`${folderTitle}~${bladeLabel}`, value)
				);
		});
	});
};
