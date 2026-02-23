import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	BackSide,
	BasicShadowMap,
	CineonToneMapping,
	ColorManagement,
	CustomToneMapping,
	DoubleSide,
	FrontSide,
	LinearSRGBColorSpace,
	LinearToneMapping,
	NeutralToneMapping,
	NoToneMapping,
	PCFShadowMap,
	PCFSoftShadowMap,
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
	Base: {
		"Enable Debug": {
			default: import.meta.env?.DEV,
			func: ({ self, value }) => self.handleDebugEnabledChange(!!value)
		},
		"Enable Controls": {
			default: true,
			func: ({ self, value }) => self.enableControls(!!value)
		},
		"Enable Axes Helper": {
			default: true,
			func: ({ self, value }) => self.enableAxesHelper(!!value)
		},
		"Enable Physics Lines": {
			default: true,
			func: ({ self, value }) => self.enablePhysicsLines(!!value)
		}
	},
	Camera: {
		Reset: {
			default: "$button",
			func: ({ self }) => self.cameraService.reset()
		}
	},
	Renderer: {
		"Auto Clear": {
			default: true,
			func: ({ self, value }) => (self.rendererInstance.autoClear = !!value)
		},
		"Clear Color": {
			default: "#262a2b",
			func: ({ self, value }) =>
				self.rendererInstance.setClearColor(
					`${value}`,
					self.rendererInstance.getClearAlpha()
				)
		},
		"Clear Alpha": {
			default: 1,
			config: { min: 0, max: 1, step: 0.0001 },
			func: ({ self, value }) =>
				self.rendererInstance.setClearAlpha(Number(value) || 0)
		},
		"Output ColorSpace": {
			default: SRGBColorSpace,
			config: {
				options: {
					SRGBColorSpace,
					LinearSRGBColorSpace
				}
			},
			func: ({ self, value }) =>
				(self.rendererInstance.outputColorSpace = value as any)
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

		"Color Management": {
			default: true,
			func: ({ value }) => (ColorManagement.enabled = !!value)
		},

		"Shadows Render Map": {
			default: true,
			func: ({ self, value }) =>
				(self.rendererInstance.shadowMap.enabled = !!value)
		},
		"Shadows Auto Update": {
			default: true,
			func: ({ self, value }) =>
				(self.rendererInstance.shadowMap.autoUpdate = !!value)
		},
		"Shadows Needs Update": {
			default: true,
			func: ({ self, value }) =>
				(self.rendererInstance.shadowMap.needsUpdate = !!value)
		},
		"Shadows Type": {
			default: PCFSoftShadowMap,
			config: {
				options: {
					BasicShadowMap,
					PCFSoftShadowMap,
					PCFShadowMap,
					VSMShadowMap
				}
			},
			func: ({ self, value }) =>
				(self.rendererInstance.shadowMap.type = value as any)
		},

		Reset: {
			default: "$button",
			func: ({ self }) => self.rendererService.reset()
		}
	},

	World: {
		// LIGHTS
		// SUN
		"Sun visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sun.visible = !!value)
		},
		"Sun Intensity": {
			default: 1.1,
			config: { min: 0, max: 5, step: 0.1 },
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

		// SUN REFLECTION
		"Sun reflection Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sunReflection.visible = !!value)
		},
		"Sun reflection Intensity": {
			default: 1,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.worldService.lights.sunReflection.intensity = Number(value) || 0)
		},
		"Sun reflection Position": {
			default: { x: 0, y: 5, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sunReflection.position.copy(value as any)
		},
		"Sun reflection LookAt": {
			default: { x: 0, y: 0, z: 0 },
			func: ({ self, value }) =>
				self.worldService.lights.sunReflection.lookAt(value as any)
		},
		"Sun reflection Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.lights.sunReflection.color.set(value as string)
		},

		// SUN PROPAGATION
		"Sun propagation Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sunPropagation.visible = !!value)
		},
		"Sun propagation Intensity": {
			default: 1,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.worldService.lights.sunPropagation.intensity = Number(value) || 0)
		},
		"Sun propagation Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.lights.sunPropagation.color.set(value as string)
		},

		"Reset Lights": {
			default: "$button",
			func: ({ self }) => self.worldService.resetLights()
		},

		// SHADOWS
		"Shadows Cast": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.lights.sun.castShadow = !!value)
		},
		"Shadows Bias": {
			default: 0,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.bias = Number(value) || 0)
		},
		"Shadows Normal Bias": {
			default: 0.05,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.normalBias = Number(value) || 0)
		},
		"Shadows Map Size": {
			default: 2048,
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
		"Shadows Near": {
			default: 0.1,
			config: { min: 0, max: 1 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.near = Number(value) || 0)
		},
		"Shadows Far": {
			default: 50,
			config: { min: 0, max: 50 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.far = Number(value) || 0)
		},
		"Shadows Top": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.top = Number(value) || 0)
		},
		"Shadows Bottom": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.bottom = Number(value) || 0)
		},
		"Shadows Left": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.left = Number(value) || 0)
		},
		"Shadows Right": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.worldService.lights.sun.shadow.camera.right = Number(value) || 0)
		},
		"Reset Shadows": {
			default: "$button",
			func: ({ self }) => self.worldService.resetShadows()
		},

		// MATERIALS
		"Material Side": {
			default: DoubleSide,
			config: {
				options: {
					DoubleSide,
					FrontSide,
					BackSide
				}
			},
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.side = value as any)
		},
		"Material Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.worldService.defaultMaterial.color.set(value as string)
		},
		"Material Transparent": {
			default: true,
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.transparent = !!value)
		},
		"Material Opacity": {
			default: 1,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.opacity = Number(value) || 0)
		},
		"Material Sheen": {
			default: 2,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.sheen = Number(value) || 0)
		},
		"Material Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.roughness = Number(value) || 0)
		},
		"Material Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.worldService.defaultMaterial.metalness = Number(value) || 0)
		},
		"Reset Material": {
			default: "$button",
			func: ({ self }) => self.worldService.resetMaterials()
		}
	},

	Hands: {
		"Material Side": {
			default: DoubleSide,
			config: {
				options: {
					DoubleSide,
					FrontSide,
					BackSide
				}
			},
			func: ({ self, value }) =>
				(self.handsService.material.side = value as any)
		},
		"Material Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.handsService.material.color.set(value as string)
		},
		"Material Transparent": {
			default: true,
			func: ({ self, value }) =>
				(self.handsService.material.transparent = !!value)
		},
		"Material Opacity": {
			default: 1,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.handsService.material.opacity = Number(value) || 0)
		},
		"Material Sheen": {
			default: 2,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.handsService.material.sheen = Number(value) || 0)
		},
		"Material Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.handsService.material.roughness = Number(value) || 0)
		},
		"Material Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.handsService.material.metalness = Number(value) || 0)
		},
		"Reset Material": {
			default: "$button",
			func: ({ self }) => self.handsService.resetMaterials()
		}
	},

	Pieces: {
		"Pieces Side": {
			default: DoubleSide,
			config: {
				options: {
					DoubleSide,
					FrontSide,
					BackSide
				}
			},
			func: ({ self, value }) =>
				(self.piecesService.material.side = value as any)
		},
		"Pieces Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.piecesService.material.color.set(value as string)
		},
		"Pieces Transparent": {
			default: true,
			func: ({ self, value }) =>
				(self.piecesService.material.transparent = !!value)
		},
		"Pieces Opacity": {
			default: 1,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.piecesService.material.opacity = Number(value) || 0)
		},
		"Pieces Sheen": {
			default: 2,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.piecesService.material.sheen = Number(value) || 0)
		},
		"Pieces Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.piecesService.material.roughness = Number(value) || 0)
		},
		"Pieces Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.piecesService.material.metalness = Number(value) || 0)
		},
		"Reset Materials": {
			default: "$button",
			func: ({ self }) => self.piecesService.resetMaterials()
		}
	}
};
