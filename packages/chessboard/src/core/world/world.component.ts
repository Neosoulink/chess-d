import { inject, singleton } from "tsyringe";
import { AmbientLight, Color, DirectionalLight, Scene } from "three";
import { AppModule } from "@quick-threejs/reactive";

@singleton()
export class WorldComponent {
	public scene!: Scene;

	constructor(@inject(AppModule) private readonly appModule: AppModule) {}

	init(scene: Scene) {
		this.scene = scene;

		this.scene.background = new Color("#211d20");
	}
}
