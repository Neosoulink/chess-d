import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	BasicShadowMap,
	CineonToneMapping,
	ColorManagement,
	CustomToneMapping,
	LinearSRGBColorSpace,
	LinearToneMapping,
	NeutralToneMapping,
	NoToneMapping,
	PCFShadowMap,
	PCFSoftShadowMap,
	Quaternion,
	QuaternionLike,
	ReinhardToneMapping,
	SRGBColorSpace,
	VSMShadowMap
} from "three";
import { BindingParams } from "tweakpane";

import { DebugService } from "../../core/game/debug/debug.service";

export const DEBUG_OPTIONS: Record<
	string,
	Record<
		string,
		{
			default: unknown;
			config?: BindingParams;
			func: (props: {
				self: DebugService;
				type: string;
				value: unknown;
			}) => unknown;
		}
	>
> = {
	Global: {
		"Enable Debug": {
			default: import.meta.env?.DEV,
			func: ({ self, value }) => (self.enabled = !!value)
		},
		Reset: {
			default: "$button",
			func: ({ self }) => self.reset()
		}
	},

	"Color Management": {
		Enabled: {
			default: true,
			func: ({ value }) => (ColorManagement.enabled = !!value)
		}
	},

	Renderer: {
		"Auto Clear": {
			default: true,
			func: ({ self, value }) => (self.renderer.autoClear = !!value)
		},
		"Clear Color": {
			default: "#262a2b",
			func: ({ self, value }) =>
				self.renderer.setClearColor(`${value}`, self.renderer.getClearAlpha())
		},
		"Output ColorSpace": {
			default: SRGBColorSpace,
			config: {
				options: {
					SRGBColorSpace,
					LinearSRGBColorSpace
				}
			},
			func: ({ self, value }) => (self.renderer.outputColorSpace = value as any)
		},
		"Tone Mapping": {
			default: NoToneMapping,
			config: {
				options: {
					NoToneMapping,
					LinearToneMapping,
					ReinhardToneMapping,
					CineonToneMapping,
					ACESFilmicToneMapping,
					AgXToneMapping,
					NeutralToneMapping,
					CustomToneMapping
				}
			},
			func: ({ self, value }) => {
				const renderer = self.app.renderer.instance();
				if (renderer) renderer.toneMapping = value as any;
			}
		},
		"Tone Exposure": {
			default: 1,
			config: { min: 0, max: 1, step: 0.0001 },
			func: ({ self, value }) => {
				const renderer = self.app.renderer.instance();
				if (renderer) renderer.toneMappingExposure = value as number;
			}
		},
		Reset: {
			default: "$button",
			func: ({ self }) => self.worldService.resetRenderer()
		}
	},

	Environment: {
		Intensity: {
			default: 1,
			config: { min: 0, max: 5 },
			func: ({ self, value }) =>
				(self.scene.environmentIntensity = Number(value) || 0)
		},
		Rotation: {
			default: { x: 0, y: 0, z: 0, w: 1 },
			func: ({ self, value }) =>
				self.scene.environmentRotation.setFromQuaternion(
					new Quaternion().copy(value as QuaternionLike)
				)
		},
		Reset: {
			default: "$button",
			func: ({ self }) => self.worldService.resetEnvironment()
		}
	},

	Lights: {
		"sun visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sun.visible = !!value)
		},
		"Sun Intensity": {
			default: 0.5,
			config: { min: 0, max: 5 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.intensity = Number(value) || 0)
		},
		"Sun Position": {
			default: { x: 0, y: 5, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sun.position.copy(value as any)
		},
		"Sun LookAt": {
			default: { x: 0, y: 0, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sun.lookAt(value as any)
		},
		"Sun Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.lights.sun.color.set(value as string)
		},

		"Reflection Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sunReflection.visible = !!value)
		},
		"Reflection Intensity": {
			default: 0.5,
			config: { min: 0, max: 5 },
			func: ({ self, value }) =>
				(self.worldService.lights.sunReflection.intensity = Number(value) || 0)
		},
		"Reflection Position": {
			default: { x: 0, y: 5, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sun.position.copy(value as any)
		},
		"Reflection LookAt": {
			default: { x: 0, y: 0, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sun.lookAt(value as any)
		},
		"Reflection Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.lights.sunReflection.color.set(value as string)
		},

		"Propagation Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sunPropagation.visible = !!value)
		},
		"Propagation Intensity": {
			default: 0.1,
			config: { min: 0, max: 5 },
			func: ({ self, value }) =>
				(self.worldService.lights.sunPropagation.intensity = Number(value) || 0)
		},
		"Propagation Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.lights.sunPropagation.color.set(value as string)
		},

		Reset: {
			default: "$button",
			func: ({ self }) => self.worldService.resetLights()
		}
	},

	shadows: {
		"Render Map": {
			default: true,
			func: ({ self, value }) => (self.renderer.shadowMap.enabled = !!value)
		},
		"Render Map Auto Update": {
			default: true,
			func: ({ self, value }) => (self.renderer.shadowMap.autoUpdate = !!value)
		},
		"Render Map Needs Update": {
			default: true,
			func: ({ self, value }) => (self.renderer.shadowMap.needsUpdate = !!value)
		},
		"Render Map Type": {
			default: PCFSoftShadowMap,
			config: {
				options: {
					BasicShadowMap,
					PCFSoftShadowMap,
					PCFShadowMap,
					VSMShadowMap
				}
			},
			func: ({ self, value }) => (self.renderer.shadowMap.type = value as any)
		},
		Cast: {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sun.castShadow = !!value)
		},
		Bias: {
			default: 0,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.bias = Number(value) || 0)
		},
		"Normal Bias": {
			default: 0.05,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.normalBias = Number(value) || 0)
		},
		"Map Size": {
			default: 4096,
			config: {
				options: {
					["Ultra Low"]: 256,
					Low: 512,
					Normal: 1024,
					High: 2048,
					["Very High"]: 4096
				}
			},
			func: ({ self, value }) => {
				const mapSize = Number(value) || 0;
				self.worldService.lights.sun.shadow.mapSize.set(mapSize, mapSize);
				self.worldService.lights.sun.shadow.map?.setSize(mapSize, mapSize);
			}
		},
		Near: {
			default: 0.1,
			config: { min: 0, max: 1 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.near = Number(value) || 0)
		},
		Far: {
			default: 50,
			config: { min: 0, max: 50 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.far = Number(value) || 0)
		},
		Top: {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.top = Number(value) || 0)
		},
		Bottom: {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.bottom = Number(value) || 0)
		},
		Left: {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.left = Number(value) || 0)
		},
		Right: {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.right = Number(value) || 0)
		},

		Reset: {
			default: "$button",
			func: ({ self }) => self.worldService.resetShadows()
		}
	}
};
