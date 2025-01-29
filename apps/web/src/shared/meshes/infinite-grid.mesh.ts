import { Color, DoubleSide, Mesh, PlaneGeometry, ShaderMaterial } from "three";

export class InfiniteGridHelper extends Mesh<PlaneGeometry, ShaderMaterial> {
	constructor(
		size1?: number,
		size2?: number,
		color?: Color,
		distance?: number,
		axes = "xzy"
	) {
		const _color = color || new Color("white");
		const _size1 = typeof size1 === "number" ? size1 : 10;
		const _size2 = typeof size2 === "number" ? size2 : 100;
		const _distance = typeof distance === "number" ? distance : 8000;
		const _planeAxes = `${axes}`.substring(0, 2);

		const _geometry = new PlaneGeometry(2, 2, 1, 1);
		const _material = new ShaderMaterial({
			side: DoubleSide,
			uniforms: {
				uSize1: {
					value: _size1
				},
				uSize2: {
					value: _size2
				},
				uColor: {
					value: _color
				},
				uDistance: {
					value: _distance
				},
				uAxes: {
					value: axes
				},
				uPlaneAxes: {
					value: _planeAxes
				}
			},
			transparent: true,
			vertexShader: `
				varying vec3 worldPosition;

				uniform vec3 uAxes;
				uniform float uDistance;

				void main() {
					vec3 pos = position.${axes} * uDistance;
					pos.${_planeAxes} += cameraPosition.${_planeAxes};

					worldPosition = pos;

					gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

				}
			`,

			fragmentShader: `
				varying vec3 worldPosition;

				uniform float uSize1;
				uniform float uSize2;
				uniform vec3 uColor;
				uniform float uDistance;

				float getGrid(float size) {
					vec2 r = worldPosition.${_planeAxes} / size;

					vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
					float line = min(grid.x, grid.y);

					return 1.0 - min(line, 1.0);
				}

				void main() {
					float d = 1.0 - min(distance(cameraPosition.${_planeAxes}, worldPosition.${_planeAxes}) / uDistance, 1.0);

					float g1 = getGrid(uSize1);
					float g2 = getGrid(uSize2);

					gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
					gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);

					if ( gl_FragColor.a <= 0.0 ) discard;
				}
			`
		});

		super(_geometry, _material);

		this.frustumCulled = false;

		if (_material.uniforms.uSize1) _material.uniforms.uSize1.value = this.size1;
		if (_material.uniforms.uSize2) _material.uniforms.uSize2.value = this.size2;
		if (_material.uniforms.uColor) _material.uniforms.uColor.value = this.color;
		if (_material.uniforms.uDistance)
			_material.uniforms.uDistance.value = this.distance;
	}

	get size1(): number {
		return this.material.uniforms.uSize1?.value || 0;
	}

	set size1(value: number) {
		if (this.material.uniforms.uSize1)
			this.material.uniforms.uSize1.value = value;
	}

	get size2(): number {
		return this.material.uniforms.uSize2?.value || 0;
	}

	set size2(value: number) {
		if (this.material.uniforms.uSize2)
			this.material.uniforms.uSize2.value = value;
	}

	get distance(): number {
		return this.material.uniforms.uDistance?.value || 0;
	}

	set distance(value: number) {
		if (this.material.uniforms.uDistance)
			this.material.uniforms.uDistance.value = value;
	}

	get color(): Color {
		return this.material.uniforms.uColor?.value || new Color();
	}

	set color(value: Color) {
		if (this.material.uniforms.uColor)
			this.material.uniforms.uColor.value = value;
	}
}
