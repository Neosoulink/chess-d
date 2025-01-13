import { Object3D, Object3DEventMap, Raycaster, Vector2 } from "three";
import { inject, singleton } from "tsyringe";
import { AppModule } from "@quick-threejs/reactive";

@singleton()
export class CoreComponent {
	public readonly raycaster = new Raycaster();
	public readonly cursor = new Vector2(1, 1);

	constructor(@inject(AppModule) private readonly appModule: AppModule) {}

	public getIntersections<
		T extends Object3D<Object3DEventMap> = Object3D<Object3DEventMap>
	>() {
		return this.raycaster.intersectObjects<T>([this.appModule.world.scene()]);
	}
}
