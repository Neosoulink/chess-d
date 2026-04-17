import type { SettingsState } from "../types/settings.type";
import { LOADER_SUPPORTED_TEXTURES } from "./loader.constant";
import { WORLD_MAP_THEME_PRESETS_CONFIGS } from "./world.constant";

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

export const SETTINGS_SUPPORTED_TEXTURES = LOADER_SUPPORTED_TEXTURES.map(
	(texture) => ({
		value: texture.id,
		label: texture.label
	})
);

export const SETTINGS_SUPPORTED_MATERIAL_THEMES: Record<
	string,
	{
		label: string;
		values?: {
			textureId?: (typeof SETTINGS_SUPPORTED_TEXTURES)[number]["value"];
			whiteSideColor?: string;
			blackSideColor?: string;
			opacity?: number;
			roughness?: number;
			metalness?: number;
			sheen?: number;
			reflectivity?: number;
			ior?: number;
			transmission?: number;
		};
	}
> = {
	default: {
		label: "Default"
	},
	"use-theme": {
		label: "Use Theme"
	},
	"aok-wood": {
		label: "Wood",
		values: {
			textureId: "texture-aok-wood",
			roughness: 0.45,
			metalness: 0.02
		}
	},
	metal: {
		label: "Metal",
		values: {
			roughness: 0.45,
			metalness: 1,
			sheen: 2
		}
	},
	glass: {
		label: "Glass",
		values: {
			roughness: 0.4,
			metalness: 0,
			sheen: 0,
			ior: 1.4,
			transmission: 0.85,
			reflectivity: 0.4
		}
	}
};

export const SETTINGS_SUPPORTED_HANDS_THEMES: Record<
	string,
	{
		label: string;
		value?: string;
	}
> = {
	white: {
		label: "White Gloves",
		value: "#ffffff"
	},
	black: {
		label: "Black Gloves",
		value: "#222222"
	},
	"use-theme": {
		label: "Use Theme"
	}
};

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
					value: SETTINGS_SUPPORTED_THEMES_COLORS[0].value
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
					value: SETTINGS_SUPPORTED_THEMES_COLORS[1].value
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
					value: SETTINGS_SUPPORTED_GRAPHICS_QUALITY[1].value
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
					value: WORLD_MAP_THEME_PRESETS_CONFIGS[3]?.id
				},
				options: WORLD_MAP_THEME_PRESETS_CONFIGS.map((theme) => ({
					value: theme.id,
					label: theme.label
				}))
			}
		}
	},
	audio: {
		label: "Audio",
		icon: "VolumeOn",
		params: {
			mute: {
				id: "settings-audio-mute-audio",
				label: "General",
				inputProps: {
					type: "checkbox",
					checked: true,
					className: "after:content-['Unmute'] checked:after:content-['Mute']"
				}
			},
			volume: {
				id: "settings-audio-volume",
				label: "Volume %",
				dependsOn: ["mute"],
				inputProps: { type: "number", min: 0, max: 100, step: 1, value: 100 }
			}
		}
	},
	"lights-shadows": {
		label: "Lights & Shadows",
		icon: "Sun",
		params: {
			"lights-intensity": {
				id: "settings-lights-shadows-lights-intensity",
				label: "Light Intensity %",
				inputProps: { type: "number", min: 0, max: 100, step: 1, value: 100 }
			},
			"enable-shadows": {
				id: "settings-lights-shadows-enable-shadows",
				label: "Enable Shadows",
				inputProps: { type: "checkbox", checked: true }
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
					min: 30,
					max: 75,
					step: 1,
					value: 40,
					pattern: "[0-9]{2}-[0-9]{2}-[0-9]{2}"
				}
			},
			"y-position": {
				id: "settings-camera-y-position",
				label: "Y Position %",
				inputProps: {
					type: "number",
					min: 0,
					max: 100,
					step: 1,
					value: 50
				}
			}
		}
	},
	chessboard: {
		label: "Chessboard",
		icon: "Chessboard",
		params: {
			theme: {
				id: "settings-chessboard-theme",
				label: "Theme",
				inputProps: {
					type: "select",
					value: Object.keys(SETTINGS_SUPPORTED_MATERIAL_THEMES)[0]
				},
				options: Object.entries(SETTINGS_SUPPORTED_MATERIAL_THEMES).map(
					([id, theme]) => ({
						value: id,
						label: theme.label
					})
				)
			}
		}
	},
	pieces: {
		label: "Pieces",
		icon: "ChessPawn",
		params: {
			theme: {
				id: "settings-chessboard-theme",
				label: "Theme",
				inputProps: {
					type: "select",
					value: Object.keys(SETTINGS_SUPPORTED_MATERIAL_THEMES)[0]
				},
				options: Object.entries(SETTINGS_SUPPORTED_MATERIAL_THEMES).map(
					([id, theme]) => ({
						value: id,
						label: theme.label
					})
				)
			}
		}
	},
	hands: {
		label: "Hands",
		icon: "HandSign",
		params: {
			visible: {
				id: "settings-hands-visible",
				label: "Visible",
				inputProps: { type: "checkbox", checked: true }
			},
			transparent: {
				id: "settings-hands-transparent",
				label: "Transparent",
				dependsOn: ["visible"],
				inputProps: { type: "checkbox", checked: true }
			},
			theme: {
				id: "settings-hands-color",
				label: "Color",
				dependsOn: ["visible"],
				inputProps: {
					type: "select",
					value: Object.keys(SETTINGS_SUPPORTED_HANDS_THEMES)[0]
				},
				options: Object.entries(SETTINGS_SUPPORTED_HANDS_THEMES).map(
					([id, theme]) => ({
						value: id,
						label: theme.label
					})
				)
			}
		}
	}
};
