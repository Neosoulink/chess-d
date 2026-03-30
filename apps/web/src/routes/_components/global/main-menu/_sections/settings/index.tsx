import { ComponentProps, FC } from "react";
import { useNavigate } from "react-router";

import { useMainMenuStore } from "@/routes/_stores";
import { ModalSection } from "@/routes/_components/custom";
import { MAIN_MENU_SECTIONS } from "@/shared/constants";
import { TitleDivider } from "@/routes/_components/custom";
import { MainMenuLabelInput } from "../../_components/label-input";
import { Icon } from "@/routes/_components/core";

export const MainMenuSettingsSection: FC = () => {
	const navigate = useNavigate();
	const { isOpen, currentSections, setOpen, setSections } = useMainMenuStore();

	const settings: {
		title: string;
		icon: keyof typeof Icon;
		inputs: {
			id: string;
			label: string;
			inputProps?: ComponentProps<typeof MainMenuLabelInput>["inputProps"];
			options?: { value: string; label: string }[];
		}[];
	}[] = [
		{
			title: "Visual & Theme",
			icon: "Export",
			inputs: [
				{
					id: "settings-general-primary-theme",
					label: "Primary Theme",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				},
				{
					id: "settings-general-secondary-theme",
					label: "Secondary Theme",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				},
				{
					id: "settings-general-graphics",
					label: "Graphics Quality",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "low", label: "Low" },
						{ value: "medium", label: "Medium" },
						{ value: "high", label: "High" }
					]
				},
				{
					id: "settings-general-background-style",
					label: "Background style",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "default", label: "Default" },
						{ value: "Sky", label: "Sky" },
						{ value: "Forest", label: "Forest" },
						{ value: "Desert", label: "Desert" },
						{ value: "City", label: "City" },
						{ value: "Beach", label: "Beach" },
						{ value: "Mountain", label: "Mountain" },
						{ value: "River", label: "River" },
						{ value: "Lake", label: "Lake" }
					]
				},
				{
					id: "settings-general-background-grid",
					label: "Floor grid",
					inputProps: {
						type: "checkbox"
					}
				}
			]
		},
		{
			title: "Camera",
			icon: "Hint",
			inputs: [
				{
					id: "settings-camera-fov",
					label: "FOV °",
					inputProps: {
						type: "number",
						min: 0,
						max: 180,
						step: 1,
						defaultValue: 0,
						pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}"
					}
				},
				{
					id: "settings-camera-tilt",
					label: "Tilt °",
					inputProps: {
						type: "number",
						min: 0,
						max: 180,
						step: 1,
						defaultValue: 0
					}
				}
			]
		},
		{
			title: "Audio",
			icon: "Hint",
			inputs: [
				{
					id: "settings-enable-audio",
					label: "Enable Audio",
					inputProps: {
						type: "checkbox",
						defaultChecked: true
					}
				},
				{
					id: "settings-music-volume",
					label: "Music Volume %",
					inputProps: {
						type: "number",
						min: 0,
						max: 100,
						step: 1,
						defaultValue: 50
					}
				},
				{
					id: "settings-sfx-volume",
					label: "SFX Volume %",
					inputProps: {
						type: "number",
						min: 0,
						max: 100,
						step: 1,
						defaultValue: 50
					}
				}
			]
		},
		{
			title: "Lights & Shadows",
			icon: "Hint",
			inputs: [
				{
					id: "settings-lights-shadows-intensity",
					label: "Light Intensity %",
					inputProps: {
						type: "number",
						min: 0,
						max: 100,
						step: 1,
						defaultValue: 100
					}
				},
				{
					id: "settings-lights-shadows-shadows",
					label: "Shadows",
					inputProps: {
						type: "checkbox"
					}
				}
			]
		},
		{
			title: "Chessboard",
			icon: "Chessboard",
			inputs: [
				{
					id: "settings-chessboard-theme",
					label: "Style",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "default", label: "Default" },
						{ value: "wood", label: "Wood" },
						{ value: "marble", label: "Marble" },
						{ value: "metal", label: "Metal" }
					]
				},
				{
					id: "settings-chessboard-white-cell-color",
					label: "White cell Color",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "White", label: "White" },
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				},
				{
					id: "settings-chessboard-black-cell-color",
					label: "Black cell Color",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "Black", label: "Black" },
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				}
			]
		},
		{
			title: "Pieces",
			icon: "Pawn",
			inputs: [
				{
					id: "settings-pieces-theme",
					label: "Style",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "default", label: "Default" },
						{ value: "wood", label: "Wood" },
						{ value: "marble", label: "Marble" },
						{ value: "metal", label: "Metal" }
					]
				},
				{
					id: "settings-pieces-white-cell-color",
					label: "White Piece Color",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "White", label: "White" },
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				},
				{
					id: "settings-pieces-black-cell-color",
					label: "Black Piece Color",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "Black", label: "Black" },
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				}
			]
		},
		{
			title: "Hands",
			icon: "Popup",
			inputs: [
				{
					id: "settings-hands-visible",
					label: "Visibility",
					inputProps: {
						type: "checkbox"
					}
				},
				{
					id: "settings-hands-transparent",
					label: "Transparent",
					inputProps: {
						type: "checkbox"
					}
				},
				{
					id: "settings-pieces-black-cell-color",
					label: "Color",
					inputProps: {
						type: "select"
					},
					options: [
						{ value: "White", label: "White" },
						{ value: "Black", label: "Black" },
						{ value: "Cyan", label: "Cyan" },
						{ value: "Magenta", label: "Magenta" },
						{ value: "Purple", label: "Purple" }
					]
				},
				{
					id: "settings-hands-animation",
					label: "Animation (and Emotes)",
					inputProps: {
						type: "checkbox"
					}
				}
			]
		}
	];

	return (
		<ModalSection
			header={{
				title: "Settings",
				icon: "Share"
			}}
			footerOptions={[
				{
					label: "Back",
					icon: "ArrowBackward",
					action: () => setSections(MAIN_MENU_SECTIONS.main)
				},
				{
					label: "Apply Changes",
					icon: "Refresh",
					disabled: true,
					action: () => {}
				}
			]}
		>
			{settings.map(({ title, icon, inputs }) => (
				<div key={title} className="flex flex-col gap-2">
					<TitleDivider title={title} icon={icon} heading="3" />

					{inputs.map(({ id, label, inputProps, options }) => (
						<MainMenuLabelInput
							key={id}
							id={id}
							labelProps={{ children: label }}
							inputProps={inputProps}
							selectOptions={options}
						/>
					))}
				</div>
			))}
		</ModalSection>
	);
};
