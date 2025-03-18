import { Pane } from "tweakpane";

import { DEBUG_PARAMS_OPTIONS } from "../constants";

export const configureTweakpane = (
	pane: Pane,
	onChange?: (type: string, value: unknown) => unknown
) => {
	pane.element.style.width = "350px";
	pane.element.style.marginLeft = "-100px";
	const params: Record<string, unknown> = {};
	const paneFolder = pane.addFolder({ title: "Debug" });

	paneFolder.expanded = false;

	Object.keys(DEBUG_PARAMS_OPTIONS).forEach((folderTitle) => {
		const folder = paneFolder.addFolder({
			title: folderTitle,
			expanded: false
		});
		const folderParams = DEBUG_PARAMS_OPTIONS[folderTitle];

		if (!folderParams) return;

		Object.keys(folderParams).forEach((bladeTitle) => {
			if (folderParams[bladeTitle]!.default === "$button")
				return folder
					.addButton({ title: bladeTitle })
					.on("click", () => onChange?.(`${folderTitle}-${bladeTitle}`, true));

			params[bladeTitle] = folderParams[bladeTitle]!.default;

			return folder
				.addBinding(params, bladeTitle, {
					...folderParams[bladeTitle]!.config,
					label: bladeTitle
						.replace(/([A-Z])/g, " $1")
						.replace(/-/g, " ")
						.trim()
						.toLowerCase()
				})
				.on("change", ({ value }) =>
					onChange?.(`${folderTitle}-${bladeTitle}`, value)
				);
		});

		folder.expanded = false;
	});
};
