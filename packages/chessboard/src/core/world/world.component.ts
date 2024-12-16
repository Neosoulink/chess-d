import "reflect-metadata";

import { inject, singleton } from "tsyringe";
import { AmbientLight, Color, DirectionalLight, Scene } from "three";
import { AppModule } from "@quick-threejs/reactive";

@singleton()
export class WorldComponent {
	public readonly ambientLight = new AmbientLight(0xffffff, 0.8);
	public readonly directionalLight = new DirectionalLight(0xffffff, 0.8);

	public scene!: Scene;

	constructor(@inject(AppModule) private readonly appModule: AppModule) {}

	init(scene: Scene) {
		this.scene = scene;

		this.directionalLight.position.set(0, 0, 1);
		this.scene.background = new Color("#211d20");
	}
}
