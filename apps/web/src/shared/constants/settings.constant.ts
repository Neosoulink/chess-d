import type { SettingsState } from "../types/settings.type";
import {
	LOADER_SUPPORTED_ENVIRONMENT_MAPS,
	LOADER_SUPPORTED_TEXTURES
} from "./loader.constant";

export const SETTINGS_LOCAL_STORAGE_KEY = "core-settings";

export const SETTINGS_SUPPORTED_THEMES_COLORS = [
	{ value: "#4deeea", label: "Cyan" },
	{ value: "#a553fc", label: "Purple" },
	{ value: "#f72585", label: "Magenta" },
	{ value: "#ffcc33", label: "Gold" }
] as const;

export const SETTINGS_SUPPORTED_GRAPHICS_QUALITY = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" }
] as const;

export const SETTINGS_SUPPORTED_ENVIRONMENT_MAPS =
	LOADER_SUPPORTED_ENVIRONMENT_MAPS.map((theme) => ({
		value: theme.id,
		label: theme.label
	}));

export const SETTINGS_SUPPORTED_TEXTURES = LOADER_SUPPORTED_TEXTURES.map(
	(texture) => ({
		value: texture.id,
		label: texture.label
	})
);

export const SETTINGS_DEFAULT_STATE: SettingsState = {
	"visual-theme": {
		label: "Visual & Theme",
		icon: "Picture",
		params: {
			"primary-theme": {
				id: "settings-visual-theme-primary-theme",
				label: "Primary Theme",
				inputProps: {
					type: "select",
					value: SETTINGS_SUPPORTED_THEMES_COLORS[3].value
				},
				options: SETTINGS_SUPPORTED_THEMES_COLORS.map((color) => ({
					value: color.value,
					label: color.label
				}))
			},
			"secondary-theme": {
				id: "settings-visual-theme-secondary-theme",
				label: "Secondary Theme",
				inputProps: {
					type: "select",
					value: SETTINGS_SUPPORTED_THEMES_COLORS[2].value
				},
				options: SETTINGS_SUPPORTED_THEMES_COLORS.map((color) => ({
					value: color.value,
					label: color.label
				}))
			},
			"graphics-quality": {
				id: "settings-visual-theme-graphics-quality",
				label: "Graphics Quality",
				inputProps: {
					type: "select",
					value: "medium"
				},
				options: SETTINGS_SUPPORTED_GRAPHICS_QUALITY.map((quality) => ({
					value: quality.value,
					label: quality.label
				}))
			},
			"background-style": {
				id: "settings-visual-theme-background-style",
				label: "Background Style",
				inputProps: {
					type: "select",
					value: "none"
				},
				options: SETTINGS_SUPPORTED_ENVIRONMENT_MAPS
			},
			"background-grid": {
				id: "settings-visual-theme-background-grid",
				label: "Background Grid",
				inputProps: {
					type: "checkbox",
					checked: false
				}
			}
		}
	},
	camera: {
		label: "Camera",
		icon: "Camera",
		params: {
			fov: {
				id: "settings-camera-fov",
				label: "FOV °",
				inputProps: {
					type: "number",
					min: 0,
					max: 180,
					step: 1,
					value: 45,
					pattern: "[0-9]{3}-[0-9]{2}-[0-9]{3}"
				}
			},
			tilt: {
				id: "settings-camera-tilt",
				label: "Tilt °",
				inputProps: {
					type: "number",
					min: 0,
					max: 180,
					step: 1,
					value: 90
				}
			}
		}
	},
	audio: {
		label: "Audio",
		icon: "VolumeOn",
		params: {
			"enable-audio": {
				id: "settings-audio-enable-audio",
				label: "Enable Audio",
				inputProps: { type: "checkbox", checked: true }
			},
			"music-volume": {
				id: "settings-audio-music-volume",
				label: "Music Volume %",
				inputProps: { type: "number", min: 0, max: 100, step: 1, value: 100 }
			},
			"sfx-volume": {
				id: "settings-audio-sfx-volume",
				label: "SFX Volume %",
				inputProps: { type: "number", min: 0, max: 100, step: 1, value: 100 }
			}
		}
	},
	"lights-shadows": {
		label: "Lights & Shadows",
		icon: "Sun",
		params: {
			"lights-shadows-intensity": {
				id: "settings-lights-shadows-intensity",
				label: "Light Intensity %",
				inputProps: { type: "number", min: 0, max: 100, step: 1, value: 100 }
			},
			"lights-shadows-shadows": {
				id: "settings-lights-shadows-shadows",
				label: "Shadows",
				inputProps: { type: "checkbox", checked: true }
			}
		}
	},
	chessboard: {
		label: "Chessboard",
		icon: "Chessboard",
		params: {
			"chessboard-theme": {
				id: "settings-chessboard-theme",
				label: "Theme",
				inputProps: { type: "select", value: "default" },
				options: [
					{ value: "default", label: "Default" },
					...SETTINGS_SUPPORTED_TEXTURES
				]
			}
		}
	},
	pieces: {
		label: "Pieces",
		icon: "ChessPawn",
		params: {
			"pieces-theme": {
				id: "settings-pieces-theme",
				label: "Theme",
				inputProps: { type: "select", value: "default" },
				options: [
					{ value: "default", label: "Default" },
					...SETTINGS_SUPPORTED_TEXTURES
				]
			}
		}
	},
	hands: {
		label: "Hands",
		icon: "HandSign",
		params: {
			"hands-visible": {
				id: "settings-hands-visible",
				label: "Visible",
				inputProps: { type: "checkbox", checked: true }
			},
			"hands-transparency": {
				id: "settings-hands-transparency",
				label: "Transparent",
				inputProps: { type: "checkbox", checked: true }
			},
			"hands-theme": {
				id: "settings-hands-color",
				label: "Color",
				inputProps: { type: "select", value: "White" },
				options: [
					{ value: "White", label: "White" },
					{ value: "Black", label: "Black" },
					{ value: "Cyan", label: "Cyan" },
					{ value: "Magenta", label: "Magenta" },
					{ value: "Purple", label: "Purple" }
				]
			},
			"enable-hands-animation": {
				id: "settings-hands-animation",
				label: "Animation (and Emotes)",
				inputProps: { type: "checkbox", checked: true }
			}
		}
	}
};
