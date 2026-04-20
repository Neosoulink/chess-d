import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import { SettingsState } from "@/shared/types";
import { useMainMenuStore, useSettingsStore } from "@/router/_stores";
import { ModalSection } from "@/router/_components/custom";
import { MAIN_MENU_SECTIONS, SETTINGS_DEFAULT_STATE } from "@/shared/constants";
import { Icon } from "@/router/_components/core";
import { TitleDivider } from "@/router/_components/custom";
import { MainMenuLabelInput } from "../../_components/label-input";

export const MainMenuSettingsSection: FC = () => {
	const { currentSections, setSections } = useMainMenuStore();
	const {
		state: storeState = {},
		applyState: applyStoreState,
		reset: resetStoreState
	} = useSettingsStore();

	const [currentState, setCurrentState] = useState<SettingsState>();

	const formattedState: (
		| {
				id: string;
				title: string;
				icon: keyof typeof Icon;
				inputs: {
					id: string;
					label: string;
					inputProps?: SettingsState[string]["params"][string]["inputProps"];
					options?: SettingsState[string]["params"][string]["options"];
				}[];
		  }
		| undefined
	)[] = useMemo(
		() =>
			Object.entries(currentState ?? {}).map(([sectionKey, sectionData]) => ({
				id: sectionKey,
				title: sectionData?.label,
				icon: sectionData?.icon,
				inputs: Object.entries(sectionData.params).map(
					([paramKey, paramData]) => ({
						id: paramKey,
						label: paramData.label,
						inputProps: {
							...paramData.inputProps,
							invalid:
								(paramData.inputProps.type === "number" &&
									(paramData.inputProps.value === "" ||
										isNaN(Number(paramData.inputProps.value)) ||
										(paramData.inputProps.min !== undefined &&
											Number(paramData.inputProps.min) >
												Number(paramData.inputProps.value)) ||
										(paramData.inputProps.max !== undefined &&
											Number(paramData.inputProps.max) <
												Number(paramData.inputProps.value)))) ||
								paramData.inputProps.invalid,
							disabled:
								paramData.dependsOn?.some(
									(dependsOn) =>
										!(currentState?.[sectionKey]?.params[dependsOn]?.inputProps
											.type === "checkbox"
											? !!currentState?.[sectionKey]?.params[dependsOn]
													?.inputProps.checked
											: !!currentState?.[sectionKey]?.params[dependsOn]
													?.inputProps.value)
								) || paramData.inputProps.disabled
						},
						options: paramData.options
					})
				)
			})),
		[currentState]
	);

	const hasInvalidState = useMemo(() => {
		let isTrue = false;

		for (const sectionData of formattedState) {
			const sectionInputs = Object.values(sectionData?.inputs ?? {});
			for (const sectionInput of sectionInputs) {
				if (sectionInput?.inputProps?.invalid) {
					isTrue = true;
					break;
				}
			}
			if (isTrue) break;
		}

		return isTrue;
	}, [currentState]);

	const canApplyChanges = useMemo(() => {
		if (hasInvalidState) return false;

		let isTrue = false;
		const currentStateEntries = Object.entries(currentState ?? {});

		for (const [sectionKey, sectionData] of currentStateEntries) {
			for (const [paramKey, paramData] of Object.entries(
				sectionData?.params ?? {}
			)) {
				const storedParam = storeState?.[sectionKey]?.params[paramKey];
				if (
					paramData?.inputProps.value !== storedParam?.inputProps.value ||
					(paramData?.inputProps.type === "checkbox" &&
						paramData?.inputProps.checked !== storedParam?.inputProps.checked)
				) {
					isTrue = true;
					break;
				}
			}
			if (isTrue) break;
		}

		return isTrue;
	}, [currentState, storeState]);

	const canResetDefault = useMemo(() => {
		return (
			JSON.stringify(currentState) === JSON.stringify(SETTINGS_DEFAULT_STATE)
		);
	}, [currentState]);

	useEffect(() => {
		if (currentSections?.[0] !== MAIN_MENU_SECTIONS.settings) return;

		setCurrentState(JSON.parse(JSON.stringify(storeState)));
	}, [storeState, currentSections]);

	return (
		<ModalSection
			header={{
				title: "Settings",
				icon: "Share"
			}}
			footerOptions={[
				{
					label: "Back",
					icon: "ActionUndo",
					action: () => setSections(MAIN_MENU_SECTIONS.main)
				},
				{
					label: "Apply Changes",
					disabled: !canApplyChanges,
					action: () => applyStoreState(currentState)
				},
				{
					label: "Reset Default",
					icon: "Refresh",
					disabled: canResetDefault,
					action: resetStoreState
				}
			]}
		>
			{formattedState.map((item, index) => (
				<div key={`${item?.id}-${index}`} className="flex flex-col gap-2">
					<TitleDivider
						title={item?.title ?? ""}
						icon={item?.icon}
						heading="3"
					/>

					{!!item?.inputs &&
						item.inputs.map(({ id, label, inputProps, options }) => {
							const inputValue =
								currentState?.[item.id]?.params[id]?.inputProps.value;

							return (
								<MainMenuLabelInput
									key={id}
									id={id}
									labelProps={{ children: label }}
									inputProps={{
										...inputProps,
										value: inputValue,
										onChange: (
											event: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
										) => {
											const sectionData = currentState?.[item.id];
											const paramData = sectionData?.params[id];
											const newValue =
												paramData?.inputProps.type === "number"
													? Math.round(Number(event.target.value))
													: event.target.value;
											const newChecked = event.target.checked;

											if (!sectionData || !paramData) return;

											if (paramData.inputProps.type === "checkbox")
												paramData.inputProps.checked = newChecked;
											else paramData.inputProps.value = newValue;

											setCurrentState({
												...currentState,
												[item.id]: sectionData
											});
										}
									}}
									selectOptions={options}
								/>
							);
						})}
				</div>
			))}
		</ModalSection>
	);
};
