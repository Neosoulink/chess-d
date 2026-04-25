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
	MeshPhysicalMaterial,
	NeutralToneMapping,
	NoToneMapping,
	PCFShadowMap,
	ReinhardToneMapping,
	SRGBColorSpace,
	VSMShadowMap
} from "three";
import { BindingParams } from "tweakpane";

import { DebugService } from "../../core/game/debug/debug.service";
import { ColorSide, ObservablePayload } from "@chess-d/shared";
import { HANDS_SUPPORT_EMOTES } from "./hands.constant";
import { HandsController } from "@/core/game/world/hands/hands.controller";

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
			default: PCFShadowMap,
			config: {
				options: {
					BasicShadowMap,
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
				(self.woldMapService.lights.sun.visible = !!value)
		},
		"Sun Intensity": {
			default: 1.1,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.intensity = Number(value) || 0)
		},
		"Sun Position": {
			default: { x: 0, y: 5, z: 0 },
			func: ({ self, value }) =>
				self.woldMapService.lights.sun.position.copy(value as any)
		},
		"Sun LookAt": {
			default: { x: 0, y: 0, z: 0 },
			func: ({ self, value }) =>
				self.woldMapService.lights.sun.lookAt(value as any)
		},
		"Sun Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.woldMapService.lights.sun.color.set(value as string)
		},

		// SUN REFLECTION
		"Sun reflection Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.visible = !!value)
		},
		"Sun reflection Intensity": {
			default: 1,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.intensity =
					Number(value) || 0)
		},
		"Sun reflection Position": {
			default: { x: 0, y: 5, z: 0 },
			func: ({ self, value }) =>
				self.woldMapService.lights.sunReflection.position.copy(value as any)
		},
		"Sun reflection LookAt": {
			default: { x: 0, y: 0, z: 0 },
			func: ({ self, value }) =>
				self.woldMapService.lights.sunReflection.lookAt(value as any)
		},
		"Sun reflection Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.woldMapService.lights.sunReflection.color.set(value as string)
		},

		// SUN PROPAGATION
		"Sun propagation Visible": {
			default: true,
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunPropagation.visible = !!value)
		},
		"Sun propagation Intensity": {
			default: 1,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunPropagation.intensity =
					Number(value) || 0)
		},
		"Sun propagation Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.woldMapService.lights.sunPropagation.color.set(value as string)
		},

		"Reset Lights": {
			default: "$button",
			func: ({ self }) => self.woldMapService.resetLights()
		},

		// SUN SHADOWS
		"Sun Shadows Cast": {
			default: true,
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.castShadow = !!value)
		},
		"Sun Shadows Bias": {
			default: 0,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.bias = Number(value) || 0)
		},
		"Sun Shadows Normal Bias": {
			default: 0.05,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.normalBias = Number(value) || 0)
		},
		"Sun Shadows Map Size": {
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
				self.woldMapService.lights.sun.shadow.mapSize.set(mapSize, mapSize);
				self.woldMapService.lights.sun.shadow.map?.setSize(mapSize, mapSize);
			}
		},
		"Sun Shadows Radius": {
			default: 2.5,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.radius = Number(value) || 0)
		},
		"Sun Shadows Near": {
			default: 0.1,
			config: { min: 0, max: 1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.near = Number(value) || 0)
		},
		"Sun Shadows Far": {
			default: 50,
			config: { min: 0, max: 50 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.far = Number(value) || 0)
		},
		"Sun Shadows Top": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.top = Number(value) || 0)
		},
		"Sun Shadows Bottom": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.bottom =
					Number(value) || 0)
		},
		"Sun Shadows Left": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.left = Number(value) || 0)
		},
		"Sun Shadows Right": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.right =
					Number(value) || 0)
		},

		// SUN REFLECTION SHADOWS
		"Sun reflection Shadows Cast": {
			default: true,
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.castShadow = !!value)
		},
		"Sun reflection Shadows Bias": {
			default: 0,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.bias =
					Number(value) || 0)
		},
		"Sun reflection Shadows Normal Bias": {
			default: 0.05,
			config: { min: -0.05, max: 0.05, step: 0.001 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.normalBias =
					Number(value) || 0)
		},
		"Sun reflection Shadows Map Size": {
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
				self.woldMapService.lights.sunReflection.shadow.mapSize.set(
					mapSize,
					mapSize
				);
				self.woldMapService.lights.sunReflection.shadow.map?.setSize(
					mapSize,
					mapSize
				);
			}
		},
		"Sun reflection Shadows Radius": {
			default: 2.5,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.radius =
					Number(value) || 0)
		},
		"Sun reflection Shadows Near": {
			default: 0.1,
			config: { min: 0, max: 1 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.camera.near =
					Number(value) || 0)
		},
		"Sun reflection Shadows Far": {
			default: 50,
			config: { min: 0, max: 50 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.camera.far =
					Number(value) || 0)
		},
		"Sun reflection Shadows Top": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sun.shadow.camera.top = Number(value) || 0)
		},
		"Sun reflection Shadows Bottom": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.camera.bottom =
					Number(value) || 0)
		},
		"Sun reflection Shadows Left": {
			default: -8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.camera.left =
					Number(value) || 0)
		},
		"Sun reflection Shadows Right": {
			default: 8,
			config: { min: -20, max: 20 },
			func: ({ self, value }) =>
				(self.woldMapService.lights.sunReflection.shadow.camera.right =
					Number(value) || 0)
		},

		"Reset Sun Shadows": {
			default: "$button",
			func: ({ self }) => self.woldMapService.resetShadows()
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
				(self.woldMapService.material.side = value as any)
		},
		"Material Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.woldMapService.material.color.set(value as string)
		},
		"Material Transparent": {
			default: true,
			func: ({ self, value }) =>
				(self.woldMapService.material.transparent = !!value)
		},
		"Material Opacity": {
			default: 1,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				self.woldMapService.material.opacity = Number(value) || 0;
			}
		},
		"Material Sheen": {
			default: 2,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.sheen = Number(value) || 0;
			}
		},
		"Material Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.roughness = Number(value) || 0;
			}
		},
		"Material Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.metalness = Number(value) || 0;
			}
		},
		"Material Ior": {
			default: 1.5,
			config: { min: 0, max: 2, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.ior = Number(value) || 0;
			}
		},
		"Material Transmission": {
			default: 0,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.transmission = Number(value) || 0;
			}
		},
		"Material Reflectivity": {
			default: 0.3,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.woldMapService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.reflectivity = Number(value) || 0;
			}
		},
		"Reset Material": {
			default: "$button",
			func: ({ self }) => self.woldMapService.resetMaterials()
		}
	},

	Hands: {
		...HANDS_SUPPORT_EMOTES.map((emote) => ({
			[`Emote ${emote.key}`]: {
				default: "$button",
				func: ({ self }) =>
					self.handsController.emote$$.next({
						side: ColorSide.white,
						duration: 3,
						emote
					} satisfies ObservablePayload<HandsController["emote$$"]>)
			}
		})).reduce(
			(acc, emote) => ({
				...acc,
				...emote
			}),
			{}
		),
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
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.sheen = Number(value) || 0;
			}
		},
		"Material Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.roughness = Number(value) || 0;
			}
		},
		"Material Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.metalness = Number(value) || 0;
			}
		},
		"Material Ior": {
			default: 1.5,
			config: { min: 0, max: 2, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.ior = Number(value) || 0;
			}
		},
		"Material Transmission": {
			default: 0,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.transmission = Number(value) || 0;
			}
		},
		"Material Reflectivity": {
			default: 0.3,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.handsService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.reflectivity = Number(value) || 0;
			}
		},
		"Reset Material": {
			default: "$button",
			func: ({ self }) => self.handsService.resetMaterials()
		}
	},

	Chessboard: {
		"Chessboard Side": {
			default: DoubleSide,
			config: {
				options: {
					DoubleSide,
					FrontSide,
					BackSide
				}
			},
			func: ({ self, value }) =>
				(self.chessboardService.material.side = value as any)
		},
		"Chessboard Color": {
			default: "#ffffff",
			func: ({ self, value }) =>
				self.chessboardService.material.color.set(value as string)
		},
		"Chessboard Transparent": {
			default: true,
			func: ({ self, value }) =>
				(self.chessboardService.material.transparent = !!value)
		},
		"Chessboard Opacity": {
			default: 1,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.chessboardService.material.opacity = Number(value) || 0)
		},
		"Chessboard Sheen": {
			default: 2,
			config: { min: 0, max: 5, step: 0.1 },
			func: ({ self, value }) => {
				const material = self.chessboardService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.sheen = Number(value) || 0;
			}
		},
		"Chessboard Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.chessboardService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.roughness = Number(value) || 0;
			}
		},
		"Chessboard Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.chessboardService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.metalness = Number(value) || 0;
			}
		},
		"Chessboard Ior": {
			default: 1.5,
			config: { min: 0, max: 2, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.chessboardService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.ior = Number(value) || 0;
			}
		},
		"Chessboard Transmission": {
			default: 0,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.chessboardService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.transmission = Number(value) || 0;
			}
		},
		"Chessboard Reflectivity": {
			default: 0.3,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.chessboardService.material.reflectivity = Number(value) || 0)
		},
		"Reset Materials": {
			default: "$button",
			func: ({ self }) => self.chessboardService.resetMaterials()
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
			func: ({ self, value }) => {
				const material = self.piecesService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.sheen = Number(value) || 0;
			}
		},
		"Pieces Roughness": {
			default: 0.45,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.piecesService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.roughness = Number(value) || 0;
			}
		},
		"Pieces Metalness": {
			default: 0.02,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.piecesService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.metalness = Number(value) || 0;
			}
		},
		"Pieces Ior": {
			default: 1.5,
			config: { min: 0, max: 2, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.piecesService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.ior = Number(value) || 0;
			}
		},
		"Pieces Transmission": {
			default: 0,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) => {
				const material = self.piecesService.material;

				if (material instanceof MeshPhysicalMaterial)
					material.transmission = Number(value) || 0;
			}
		},
		"Pieces Reflectivity": {
			default: 0.3,
			config: { min: 0, max: 1, step: 0.01 },
			func: ({ self, value }) =>
				(self.piecesService.material.reflectivity = Number(value) || 0)
		},
		"Reset Materials": {
			default: "$button",
			func: ({ self }) => self.piecesService.resetMaterials()
		}
	}
};
