import { inject, singleton } from "tsyringe";
import { filter, map, Observable, share, Subject } from "rxjs";
import { AppModule } from "@quick-threejs/reactive";
import { Physics } from "@chess-d/rapier-physics";

import { DebugComponent } from "./debug.component";

@singleton()
export class DebugController {
	public readonly gui$$ = new Subject<any>();
	public readonly physicsDebugRendered$: Observable<
		InstanceType<Physics["rapier"]["DebugRenderBuffers"]>
	>;

	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(DebugComponent) private readonly component: DebugComponent,
		@inject(Physics) private readonly _physics: Physics
	) {
		this.physicsDebugRendered$ = this.appModule.timer.step$().pipe(
			filter(() => !!this.appModule?.debug?.enabled),
			map(() => this._physics.world.debugRender()),
			share()
		);
	}
}
