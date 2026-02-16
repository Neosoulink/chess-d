import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	BasicShadowMap,
	CineonToneMapping,
	CustomToneMapping,
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

export const DEBUG_PARAMS_OPTIONS: Record<
	string,
	Record<string, { default: unknown; config: BindingParams }>
> = {
	global: {
		reset: {
			default: "$button",
			config: {}
		}
	},
	colorManagement: {
		enabled: {
			default: true,
			config: {}
		},
		reset: {
			default: "$button",
			config: {}
		}
	},
	renderer: {
		autoClear: {
			default: true,
			config: {}
		},
		clearColor: {
			default: "#262a2b",
			config: {}
		},
		outputColorSpace: {
			default: SRGBColorSpace,
			config: {
				options: {
					SRGBColorSpace,
					LinearSRGBColorSpace
				}
			}
		},
		toneMapping: {
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
			}
		},
		toneExposure: {
			default: 1,
			config: { min: 0, max: 1, step: 0.0001 }
		},
		reset: {
			default: "$button",
			config: {}
		}
	},
	environment: {
		enable: {
			default: true,
			config: {}
		},
		intensity: {
			default: 1,
			config: { min: 0, max: 5 }
		},
		rotation: {
			default: { x: 0, y: 0, z: 0, w: 1 },
			config: {}
		},
		reset: {
			default: "$button",
			config: {}
		}
	},

	lights: {
		enableAmbient: {
			default: true,
			config: {}
		},
		ambientIntensity: {
			default: 0.1,
			config: { min: 0, max: 5 }
		},
		ambientColor: {
			default: "#ffffff",
			config: {}
		},

		enableDirectional: {
			default: true,
			config: {}
		},
		directionalIntensity: {
			default: 0.5,
			config: { min: 0, max: 5 }
		},
		directionalPosition: {
			default: { x: 0, y: 5, z: 0 },
			config: {}
		},
		directionalColor: {
			default: "#ffffff",
			config: {}
		},
		// Sun
		sunEnabled: {
			default: true,
			config: {}
		},
		sunIsNight: {
			default: false,
			config: {}
		},
		sunElevation: {
			default: 2,
			config: { min: 0, max: 90, step: 0.1 }
		},
		sunAzimuth: {
			default: 90,
			config: { min: -180, max: 180, step: 0.1 }
		},
		reset: {
			default: "$button",
			config: {}
		}
	},

	shadows: {
		shadowMap: {
			default: true,
			config: {}
		},
		shadowMapAutoUpdate: {
			default: true,
			config: {}
		},
		shadowMapNeedsUpdate: {
			default: true,
			config: {}
		},
		shadowMapType: {
			default: PCFSoftShadowMap,
			config: {
				options: {
					BasicShadowMap,
					PCFSoftShadowMap,
					PCFShadowMap,
					VSMShadowMap
				}
			}
		},
		cast: {
			default: true,
			config: {}
		},
		bias: {
			default: 0,
			config: { min: -0.05, max: 0.05, step: 0.001 }
		},
		normalBias: {
			default: 0.05,
			config: { min: -0.05, max: 0.05, step: 0.001 }
		},
		mapSize: {
			default: 4096,
			config: {
				options: {
					["Ultra Low"]: 256,
					Low: 512,
					Normal: 1024,
					High: 2048,
					["Very High"]: 4096
				}
			}
		},
		near: {
			default: 0.1,
			config: { min: 0, max: 1 }
		},
		far: {
			default: 50,
			config: { min: 0, max: 50 }
		},
		top: {
			default: 8,
			config: { min: -20, max: 20 }
		},
		bottom: {
			default: -8,
			config: { min: -20, max: 20 }
		},
		left: {
			default: -8,
			config: { min: -20, max: 20 }
		},
		right: {
			default: 8,
			config: { min: -20, max: 20 }
		},

		reset: {
			default: "$button",
			config: {}
		}
	}
};
