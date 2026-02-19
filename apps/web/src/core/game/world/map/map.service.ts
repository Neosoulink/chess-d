import {
	BOARD_CELL_SIZE,
	BOARD_MATRIX_RANGE_SIZE,
	BOARD_RANGE_CELLS_HALF_SIZE,
	ObservablePayload
} from "@chess-d/shared";
import { AppModule } from "@quick-threejs/reactive/worker";
import {
	Color,
	Group,
	Mesh,
	Object3DEventMap,
	PlaneGeometry,
	ShadowMaterial
} from "three";
import {
	Font,
	TextGeometry,
	TextGeometryParameters
} from "three/examples/jsm/Addons.js";
import { inject, Lifecycle, scoped } from "tsyringe";

import { InfiniteGridHelper } from "../../../../shared/meshes";
import { WorldService } from "../world.service";
import { WorldController } from "../world.controller";

@scoped(Lifecycle.ContainerScoped)
export class MapService {
	public readonly floor = new Group();
	public readonly defaultGridsLabels = new Group();

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _world: WorldService
	) {
		const floorGrid = new InfiniteGridHelper(
			BOARD_CELL_SIZE,
			BOARD_CELL_SIZE,
			new Color("#bbb"),
			10
		);
		const floorShadow = new Mesh(
			new PlaneGeometry(50, 50),
			new ShadowMaterial({
				opacity: 0.2
			})
		);

		floorGrid.name = "grid";
		floorShadow.name = "shadow";

		this.floor.add(floorGrid, floorShadow);
	}

	public resetFloor(): void {
		const floorGrid = this.floor.getObjectByName("grid") as
			| InfiniteGridHelper
			| undefined;
		const floorShadow = this.floor.getObjectByName("shadow") as
			| Mesh<PlaneGeometry, ShadowMaterial, Object3DEventMap>
			| undefined;

		if (floorGrid) {
			floorGrid.position.setY(-0.1);
			if (typeof floorGrid.material.uniforms.uDistance?.value === "number")
				floorGrid.material.uniforms.uDistance.value = 0;
		}

		if (floorShadow) {
			floorShadow.receiveShadow = true;
			floorShadow.material.opacity = 0.3;
			floorShadow.rotation.x = -Math.PI / 2;
			floorShadow.position.y = -0.09;
		}

		this.floor.position.setY(-0.09);
	}

	public resetDefaultGridsLabels(): void {
		const font = this._app.loader.getLoadedResources()["helvetikerFont"] as
			| Font
			| undefined;

		if (!font) return;

		if (!this.defaultGridsLabels.children.length)
			Array.from(Array(BOARD_MATRIX_RANGE_SIZE).keys()).forEach((i) => {
				const geometryParams: TextGeometryParameters = {
					font,
					size: 0.35,
					height: 0.1,
					depth: 0.01,
					bevelSize: 0.01,
					bevelThickness: 0.01,
					bevelEnabled: true
				};
				const letterGeometry = new TextGeometry(
					(i + 10).toString(36).toUpperCase(),
					geometryParams
				);
				letterGeometry.center();
				letterGeometry.rotateX(-Math.PI / 2);
				letterGeometry.rotateY(Math.PI);

				const numberGeometry = new TextGeometry(`${i + 1}`, geometryParams);
				numberGeometry.center();
				numberGeometry.rotateX(-Math.PI / 2);
				numberGeometry.rotateY(Math.PI);

				const letterMesh = new Mesh(
					letterGeometry,
					this._world.defaultMaterial
				);
				letterMesh.castShadow = true;
				letterMesh.receiveShadow = true;
				letterMesh.position.set(
					BOARD_RANGE_CELLS_HALF_SIZE - BOARD_CELL_SIZE - i,
					0,
					-BOARD_RANGE_CELLS_HALF_SIZE
				);
				letterMesh.scale.setScalar(0);

				const numberMesh = new Mesh(
					numberGeometry,
					this._world.defaultMaterial
				);
				numberMesh.castShadow = true;
				numberMesh.receiveShadow = true;
				numberMesh.position.set(
					BOARD_RANGE_CELLS_HALF_SIZE,
					0,
					-BOARD_RANGE_CELLS_HALF_SIZE + BOARD_CELL_SIZE + i
				);

				this.defaultGridsLabels.position.setY(-0.1);
				this.defaultGridsLabels.add(letterMesh, numberMesh);
			});

		this.defaultGridsLabels.traverse((child) => {
			if (child instanceof Mesh) child.scale.setScalar(0);
		});
	}

	public resetScenes(): void {
		const scene = this._world.scene;
		scene.add(this.floor, this.defaultGridsLabels);
	}

	public reset() {
		this.resetDefaultGridsLabels();
		this.resetFloor();
		this.resetScenes();
	}

	public handleIntroAnimation(
		progress: ObservablePayload<WorldController["introAnimation$"]>
	) {
		const floorGrid = this.floor.getObjectByName("grid") as InfiniteGridHelper;

		if (typeof floorGrid.material.uniforms.uDistance?.value === "number")
			floorGrid.material.uniforms.uDistance.value = progress * 40;

		this.defaultGridsLabels.traverseVisible((child) => {
			if (child instanceof Mesh) child.scale.setScalar(progress);
		});
	}
}
