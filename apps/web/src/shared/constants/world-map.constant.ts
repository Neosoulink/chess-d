import { QuaternionLike, Vector3Like } from "three";

import cyanPurpleNebulaLowEnvPath from "@/assets/textures/cyan-purple-nebula-low.png?url";
import darkBlueNebulaEnvPath from "@/assets/textures/dark-blue-nebula.jpg?url";
import roadEnvPath from "@/assets/textures/road.jpg?url";
import pureSkyEnvPath from "@/assets/textures/pure-sky.jpg?url";

export const WORLD_MAP_SUPPORTED_BACKGROUNDS = [
	{
		id: "dark-blue-nebula-env",
		sourcePath: darkBlueNebulaEnvPath
	},
	{
		id: "cyan-purple-nebula-low-env",
		sourcePath: cyanPurpleNebulaLowEnvPath
	},
	{
		id: "pure-sky-env",
		sourcePath: pureSkyEnvPath
	},
	{
		id: "road-env",
		sourcePath: roadEnvPath
	}
] as const;

export const WORLD_MAP_CONFIGS: {
	name: string;
	values?: {
		environment?: {
			mapId?: (typeof WORLD_MAP_SUPPORTED_BACKGROUNDS)[number]["id"];
			intensity?: number;
			rotation?: Partial<QuaternionLike>;
			backgroundMapId?: (typeof WORLD_MAP_SUPPORTED_BACKGROUNDS)[number]["id"];
			backgroundMapIntensity?: number;
			backgroundMapRotation?: Partial<QuaternionLike>;
			backgroundBlurriness?: number;
		};
		skybox?: {
			mapId: (typeof WORLD_MAP_SUPPORTED_BACKGROUNDS)[number]["id"];
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
		name: "Road",
		values: {
			environment: {
				mapId: "road-env",
				intensity: 1.2
			},
			lights: {
				sunIntensity: 1.5,
				sunPosition: { x: 7, y: 3, z: 5 },
				sunReflectionIntensity: 0.2,
				sunPropagationIntensity: 0.2
			},
			skybox: {
				mapId: "road-env",
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
		name: "Pure Sky",
		values: {
			environment: {
				mapId: "pure-sky-env",
				intensity: 1,
				backgroundMapId: "pure-sky-env"
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
		name: "Dark Deep Space",
		values: {
			environment: {
				mapId: "cyan-purple-nebula-low-env",
				intensity: 0.9,
				backgroundMapId: "dark-blue-nebula-env",
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
		name: "None"
	}
];
