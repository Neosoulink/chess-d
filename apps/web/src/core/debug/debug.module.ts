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
		self.addEventListener("message", this._onMessage.bind(this));
	}

	private _onMessage(e: MessageEvent): void {
		if ((e.data?.type as string)?.startsWith("gui_"))
			this.controller.gui$$.next(e.data);
	}

	public init(): void {
		if (this.appModule.debug.enabled())
			this.appModule.world.scene().add(this.component.lines);

		this.controller.physicsDebugRendered$.subscribe({
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

	public dispose(): void {
		self.removeEventListener("message", this._onMessage.bind(this));
	}
}
