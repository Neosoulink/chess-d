import { inject, singleton } from "tsyringe";
import { BufferAttribute } from "three";
import { AppModule, Module } from "@quick-threejs/reactive";

import { DebugComponent } from "./debug.component";
import { DebugController } from "./debug.controller";

@singleton()
export class DebugModule implements Module {
	constructor(
		@inject(DebugComponent) private readonly component: DebugComponent,
		@inject(DebugController) private readonly controller: DebugController,
		@inject(AppModule) private readonly appModule: AppModule
	) {
		if (this.appModule.debug.enabled())
			appModule.world.scene().add(this.component.lines);

		this.controller.physicsDebugRender$.subscribe({
			next: (buffers) => {
				this.component.lines.geometry.setAttribute(
					"position",
					new BufferAttribute(buffers.vertices, 3)
				);
				this.component.lines.geometry.setAttribute(
					"color",
					new BufferAttribute(buffers.colors, 4)
				);
			}
		});
	}

	init(): void {}

	dispose(): void {
		throw new Error("Method not implemented.");
	}
}
