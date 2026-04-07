import { QuaternionLike, Vector3Like } from "three";

import { LOADER_SUPPORTED_ENVIRONMENT_MAPS } from "./loader.constant";

export const WORLD_MAP_SUPPORTED_THEMES: {
	id: (typeof LOADER_SUPPORTED_ENVIRONMENT_MAPS)[number]["id"] | "none";
	label: (typeof LOADER_SUPPORTED_ENVIRONMENT_MAPS)[number]["label"] | "None";
}[] = [
	...(LOADER_SUPPORTED_ENVIRONMENT_MAPS.map((background) => ({
		id: background.id,
		label: background.label
	})) as any),
	{ id: "none", label: "None" }
];

export const WORLD_MAP_CONFIGS: {
	id: (typeof WORLD_MAP_SUPPORTED_THEMES)[number]["id"];
	values?: {
		environment?: {
			mapId?: (typeof LOADER_SUPPORTED_ENVIRONMENT_MAPS)[number]["id"];
			intensity?: number;
			rotation?: Partial<QuaternionLike>;
			backgroundMapId?: (typeof LOADER_SUPPORTED_ENVIRONMENT_MAPS)[number]["id"];
			backgroundMapIntensity?: number;
			backgroundMapRotation?: Partial<QuaternionLike>;
			backgroundBlurriness?: number;
		};
		skybox?: {
			mapId: (typeof LOADER_SUPPORTED_ENVIRONMENT_MAPS)[number]["id"];
			height?: number;
			radius?: number;
			position?: Partial<Vector3Like>;
			rotation?: Partial<QuaternionLike>;
			intensity?: number;
			resolution?: number;
		};
		lights?: {
			sunVisible?: boolean;
			sunColor?: string;
			sunIntensity?: number;
			sunPosition?: Partial<Vector3Like>;
			sunCastShadow?: boolean;
			sunLookAt?: Partial<Vector3Like>;
			sunReflectionVisible?: boolean;
			sunReflectionColor?: string;
			sunReflectionIntensity?: number;
			sunReflectionPosition?: Partial<Vector3Like>;
			sunReflectionCastShadow?: boolean;
			sunReflectionLookAt?: Partial<Vector3Like>;
			sunPropagationVisible?: boolean;
			sunPropagationColor?: string;
			sunPropagationIntensity?: number;
		};
		floor?: {
			enabled?: boolean;
			enabledShadow?: boolean;
			enabledGrids?: boolean;
			shadowOpacity?: number;
		};
	};
}[] = [
	{
		id: "env-map-world-road",
		values: {
			environment: {
				mapId: "env-map-world-road",
				intensity: 1.2
			},
			lights: {
				sunIntensity: 1.5,
				sunPosition: { x: 7, y: 3, z: 5 },
				sunReflectionIntensity: 0.2,
				sunPropagationIntensity: 0.2
			},
			skybox: {
				mapId: "env-map-world-road",
				height: 10,
				radius: 75,
				position: { y: 9.81 }
			},
			floor: {
				enabledGrids: false
			}
		}
	},
	{
		id: "env-map-world-pure-sky",
		values: {
			environment: {
				mapId: "env-map-world-pure-sky",
				intensity: 1,
				backgroundMapId: "env-map-world-pure-sky"
			},
			lights: {
				sunIntensity: 0.7,
				sunPosition: { x: 1 },
				sunReflectionIntensity: 0.6,
				sunPropagationIntensity: 0.4
			},
			floor: {
				enabledGrids: false,
				shadowOpacity: 0.15
			}
		}
	},
	{
		id: "env-map-world-dark-blue-nebula",
		values: {
			environment: {
				mapId: "env-map-world-cyan-purple-nebula-low",
				intensity: 0.9,
				backgroundMapId: "env-map-world-dark-blue-nebula",
				backgroundMapIntensity: 6.5
			},
			lights: {
				sunIntensity: 0.9,
				sunPosition: { x: -0.45, z: -3 },
				sunReflectionIntensity: 0.7,
				sunReflectionCastShadow: true,
				sunPropagationIntensity: 0.45
			},
			floor: {
				enabled: false
			}
		}
	},
	{
		id: "none"
	}
];
