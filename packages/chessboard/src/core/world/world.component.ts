import "reflect-metadata";

import { singleton } from "tsyringe";
import { AmbientLight, DirectionalLight, Scene } from "three";

@singleton()
export class WorldComponent {
	public readonly ambientLight = new AmbientLight(0xffffff, 0.8);
	public readonly directionalLight = new DirectionalLight(0xffffff, 0.8);

	public scene!: Scene;

	constructor() {}

	init(scene: Scene) {
		this.scene = scene;
	}
}
